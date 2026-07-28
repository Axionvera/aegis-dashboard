import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submissionLedger } from '@/features/forms/idempotency';
import TransferModal from '@/features/investor/components/TransferModal';
import type { RawTransactionOutcome } from '@/components/transactions/types';
import type { PortfolioAsset } from '@/lib/aegis/types';

/**
 * End-to-end cover for the two guarantees this modal now makes:
 * a duplicate confirm cannot produce a second transfer (#39), and a failed
 * transfer offers the recovery step that matches the failure (#43).
 */

const ADDRESS = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
const RECIPIENT = 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';

const transfer = vi.fn<(...args: unknown[]) => Promise<RawTransactionOutcome>>();
const checkWhitelist = vi.fn(async () => true);
const connect = vi.fn(async () => {});

vi.mock('@/hooks/useAegis', () => ({
  useAegis: () => ({
    checkWhitelist: (...args: unknown[]) => checkWhitelist(...(args as [])),
    transfer: (...args: unknown[]) => transfer(...args),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({ address: ADDRESS, network: 'TESTNET', connect }),
}));

const asset: PortfolioAsset = {
  id: 'ny-cre',
  name: 'Manhattan Commercial Real Estate',
  ticker: 'NY-CRE',
  balance: 100,
  decimals: 2,
  metadata: {
    assetClass: 'Real Estate',
    issuer: 'Aegis Property Holdings LLC',
    jurisdiction: 'United States',
    description: 'Test asset.',
  },
  compliance: { state: 'compliant', label: 'Compliant', detail: 'Checks are current.' },
  transferEligibility: { state: 'eligible', reasons: [] },
  isDataAvailable: true,
};

/** Fills the form and advances to the review screen. */
const reachReview = async (amount = '10') => {
  render(<TransferModal asset={asset} onClose={vi.fn()} />);

  fireEvent.change(screen.getByPlaceholderText('GABC...'), { target: { value: RECIPIENT } });
  fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: amount } });
  fireEvent.click(screen.getByRole('button', { name: 'Review Transfer' }));

  return screen.findByRole('button', { name: 'Confirm & Sign' });
};

beforeEach(() => {
  vi.clearAllMocks();
  submissionLedger.clear();
  transfer.mockResolvedValue({ status: 'SUCCESS', hash: 'mock_tx_hash_1234567890' });
});

describe('TransferModal — idempotency guard', () => {
  it('submits once when Confirm is clicked twice in a row', async () => {
    const confirm = await reachReview();

    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await screen.findByText('Transaction confirmed');
    expect(transfer).toHaveBeenCalledTimes(1);
  });

  it('replays the original receipt instead of signing a second transfer', async () => {
    const confirm = await reachReview();

    fireEvent.click(confirm);
    await screen.findByText('Transaction confirmed');

    // A confirm arriving after the receipt (stale click, restored view) must
    // not reach the SDK again.
    fireEvent.click(confirm);
    await waitFor(() => expect(transfer).toHaveBeenCalledTimes(1));
  });
});

describe('TransferModal — SDK error recovery', () => {
  it('offers form correction for a compliance refusal', async () => {
    transfer.mockResolvedValue({
      status: 'FAILED',
      errorMessage: 'Recipient account is not authorised to hold this asset.',
    });

    fireEvent.click(await reachReview());

    expect(await screen.findByText('Blocked by compliance rules')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit details' })).toBeInTheDocument();
    expect(screen.getByText(/not legal or financial advice/i)).toBeInTheDocument();
  });

  it('lets the user retry after a refusal that never reached the network', async () => {
    transfer.mockResolvedValueOnce({
      status: 'FAILED',
      errorMessage: 'Invalid destination address.',
    });

    fireEvent.click(await reachReview());
    await screen.findByText('The request was rejected as invalid');

    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review Transfer' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm & Sign' }));

    await screen.findByText('Transaction confirmed');
    expect(transfer).toHaveBeenCalledTimes(2);
  });

  it('warns instead of retrying when the outcome is unconfirmed', async () => {
    transfer.mockResolvedValue({ status: 'not_a_real_status', hash: 'mock_tx_hash_1234567890' });

    fireEvent.click(await reachReview());

    expect(await screen.findByText('Outcome could not be confirmed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /check the explorer/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again|retry/i })).not.toBeInTheDocument();
  });

  it('surfaces a thrown transport error with a recovery plan', async () => {
    transfer.mockRejectedValue(new TypeError('Failed to fetch'));

    fireEvent.click(await reachReview());

    expect(await screen.findByText('Network unreachable')).toBeInTheDocument();
    expect(screen.getByText(/may have reached the network/i)).toBeInTheDocument();
  });
});
