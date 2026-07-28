import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { submissionLedger } from '@/features/forms/idempotency';
import TransferModal from '@/features/investor/components/TransferModal';
import type { RawTransactionOutcome } from '@/components/transactions/types';
import type { PortfolioAsset } from '@/lib/aegis/types';

/**
 * End-to-end cover for the guarantee this modal now makes: one user intent
 * produces at most one transfer, however many times Confirm is clicked (#39).
 */

const ADDRESS = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
const RECIPIENT = 'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';

const transfer = vi.fn<(...args: unknown[]) => Promise<RawTransactionOutcome>>();
const checkWhitelist = vi.fn(async () => true);

vi.mock('@/hooks/useAegis', () => ({
  useAegis: () => ({
    checkWhitelist: (...args: unknown[]) => checkWhitelist(...(args as [])),
    transfer: (...args: unknown[]) => transfer(...args),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({ address: ADDRESS, network: 'TESTNET' }),
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

  it('allows a genuinely different transfer after one has been submitted', async () => {
    const confirm = await reachReview('10');

    fireEvent.click(confirm);
    await screen.findByText('Transaction confirmed');
    expect(transfer).toHaveBeenCalledTimes(1);

    // A second modal with a different amount is a new intent, not a duplicate.
    cleanup();
    fireEvent.click(await reachReview('25'));
    await screen.findByText('Transaction confirmed');

    expect(transfer).toHaveBeenCalledTimes(2);
  });
});
