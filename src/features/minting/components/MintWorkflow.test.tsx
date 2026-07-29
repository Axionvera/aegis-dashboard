import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submissionLedger } from '@/features/forms/idempotency';
import MintWorkflow from '@/features/minting/components/MintWorkflow';
import type { RawTransactionOutcome } from '@/components/transactions/types';
import { mintableAssetsFixture } from '@/features/minting/fixtures';

/**
 * Cover for the admin mint workflow (#6):
 * validation, compliance pre-check, review → sign → receipt,
 * idempotent confirm, and SDK error recovery for failure/unknown.
 */

const ADDRESS = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
const RECIPIENT = 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';

const mint = vi.fn<(...args: unknown[]) => Promise<RawTransactionOutcome>>();
const checkWhitelist = vi.fn(async () => true);
const connect = vi.fn(async () => {});

vi.mock('@/hooks/useAegis', () => ({
  useAegis: () => ({
    checkWhitelist: (...args: unknown[]) => checkWhitelist(...(args as [])),
    mint: (...args: unknown[]) => mint(...args),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({ address: ADDRESS, network: 'TESTNET', connect }),
}));

/** Fills the form and advances to the review screen. */
const reachReview = async (amount = '10') => {
  render(<MintWorkflow assets={mintableAssetsFixture} />);

  fireEvent.change(screen.getByLabelText(/recipient address/i), {
    target: { value: RECIPIENT },
  });
  fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: amount } });
  fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

  return screen.findByRole('button', { name: 'Confirm & Sign' });
};

beforeEach(() => {
  vi.clearAllMocks();
  submissionLedger.clear();
  checkWhitelist.mockResolvedValue(true);
  mint.mockResolvedValue({ status: 'SUCCESS', hash: 'mock_tx_hash_mint_0987654321' });
});

describe('MintWorkflow — happy path', () => {
  it('checks compliance then shows review before signing', async () => {
    await reachReview('100');

    expect(checkWhitelist).toHaveBeenCalledWith(RECIPIENT);
    expect(screen.getByRole('button', { name: 'Confirm & Sign' })).toBeInTheDocument();
    expect(screen.getByText(/issues new supply/i)).toBeInTheDocument();
    expect(mint).not.toHaveBeenCalled();
  });

  it('calls mint with recipient, amount, and asset ticker on confirm', async () => {
    fireEvent.click(await reachReview('25'));

    await screen.findByText('Transaction confirmed');
    expect(mint).toHaveBeenCalledWith(
      RECIPIENT,
      25,
      expect.any(Function),
      'NY-CRE',
    );
  });

  it('shows a receipt after a successful mint', async () => {
    fireEvent.click(await reachReview());

    expect(await screen.findByText('Transaction confirmed')).toBeInTheDocument();
    expect(screen.getByText(/Mint · Success/i)).toBeInTheDocument();
  });
});

describe('MintWorkflow — validation', () => {
  it('blocks empty fields before any network call', async () => {
    render(<MintWorkflow />);

    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/fill all fields/i);
    expect(checkWhitelist).not.toHaveBeenCalled();
    expect(mint).not.toHaveBeenCalled();
  });

  it('blocks an invalid recipient address', async () => {
    render(<MintWorkflow />);

    fireEvent.change(screen.getByLabelText(/recipient address/i), {
      target: { value: 'not-valid' },
    });
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid Stellar address/i);
    expect(checkWhitelist).not.toHaveBeenCalled();
  });

  it('blocks a non-positive amount', async () => {
    render(<MintWorkflow />);

    fireEvent.change(screen.getByLabelText(/recipient address/i), {
      target: { value: RECIPIENT },
    });
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/greater than zero/i);
    expect(checkWhitelist).not.toHaveBeenCalled();
  });
});

describe('MintWorkflow — compliance pre-check', () => {
  it('surfaces a not-whitelisted recipient before review', async () => {
    checkWhitelist.mockResolvedValue(false);
    render(<MintWorkflow />);

    fireEvent.change(screen.getByLabelText(/recipient address/i), {
      target: { value: RECIPIENT },
    });
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/not KYC whitelisted/i);
    expect(screen.queryByRole('button', { name: 'Confirm & Sign' })).not.toBeInTheDocument();
    expect(mint).not.toHaveBeenCalled();
  });

  it('surfaces an RPC failure distinctly from not-whitelisted', async () => {
    checkWhitelist.mockRejectedValue(new Error('RPC down'));
    render(<MintWorkflow />);

    fireEvent.change(screen.getByLabelText(/recipient address/i), {
      target: { value: RECIPIENT },
    });
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not verify compliance/i);
    expect(mint).not.toHaveBeenCalled();
  });
});

describe('MintWorkflow — idempotency guard', () => {
  it('submits once when Confirm is clicked twice in a row', async () => {
    const confirm = await reachReview();

    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await screen.findByText('Transaction confirmed');
    expect(mint).toHaveBeenCalledTimes(1);
  });
});

describe('MintWorkflow — error and unknown states', () => {
  it('offers recovery for a compliance refusal', async () => {
    mint.mockResolvedValue({
      status: 'FAILED',
      errorMessage: 'Recipient account is not authorised to hold this asset.',
    });

    fireEvent.click(await reachReview());

    expect(await screen.findByText('Blocked by compliance rules')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit details' })).toBeInTheDocument();
  });

  it('warns instead of retrying when the outcome is unconfirmed', async () => {
    mint.mockResolvedValue({ status: 'not_a_real_status', hash: 'mock_tx_hash_mint_0987654321' });

    fireEvent.click(await reachReview());

    expect(await screen.findByText('Outcome could not be confirmed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /check the explorer/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again|retry/i })).not.toBeInTheDocument();
  });

  it('surfaces a thrown transport error with a recovery plan', async () => {
    mint.mockRejectedValue(new TypeError('Failed to fetch'));

    fireEvent.click(await reachReview());

    expect(await screen.findByText('Network unreachable')).toBeInTheDocument();
    expect(screen.getByText(/may have reached the network/i)).toBeInTheDocument();
  });

  it('lets the user return to the form after a recoverable failure', async () => {
    mint.mockResolvedValueOnce({
      status: 'FAILED',
      errorMessage: 'Invalid destination address.',
    });

    fireEvent.click(await reachReview());
    await screen.findByText('The request was rejected as invalid');

    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    expect(await screen.findByRole('button', { name: /review mint/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm & Sign' }));

    await screen.findByText('Transaction confirmed');
    expect(mint).toHaveBeenCalledTimes(2);
  });
});

describe('MintWorkflow — asset selector', () => {
  it('includes selected asset details on the review screen', async () => {
    render(<MintWorkflow />);

    fireEvent.change(screen.getByLabelText(/^asset$/i), {
      target: { value: 'ust-6m' },
    });
    fireEvent.change(screen.getByLabelText(/recipient address/i), {
      target: { value: RECIPIENT },
    });
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /review mint/i }));

    await screen.findByRole('button', { name: 'Confirm & Sign' });
    expect(screen.getByRole('heading', { name: /Mint UST-6M/i })).toBeInTheDocument();
    expect(screen.getByText('Fixed Income')).toBeInTheDocument();
    expect(screen.getByText('US Treasury Bill 6-Mo (UST-6M)')).toBeInTheDocument();
  });
});
