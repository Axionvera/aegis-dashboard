import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TransactionReviewModal from './TransactionReviewModal';
import TransactionReview from './TransactionReview';
import { transferDetailsFixture, whitelistDetailsFixture } from './fixtures';

describe('TransactionReview', () => {
  it('renders operation summary, expected result, and risk notes', () => {
    render(
      <TransactionReview
        details={transferDetailsFixture}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /transfer aegis/i })).toBeInTheDocument();
    expect(screen.getByText('Expected result')).toBeInTheDocument();
    expect(screen.getByText(transferDetailsFixture.expectedResult!)).toBeInTheDocument();
    expect(screen.getByText('Risk notes')).toBeInTheDocument();
    expect(screen.getByText(/transfers are final once confirmed/i)).toBeInTheDocument();
    expect(screen.getByText('TESTNET')).toBeInTheDocument();
  });
});

describe('TransactionReviewModal', () => {
  it('renders as a dialog and forwards confirm / cancel actions', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <TransactionReviewModal
        details={whitelistDetailsFixture}
        onConfirm={onConfirm}
        onCancel={onCancel}
        footer="Protocol-level compliance information. Not legal, regulatory, or financial advice."
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/add address to kyc whitelist/i)).toBeInTheDocument();
    expect(screen.getByText(/expected result/i)).toBeInTheDocument();
    expect(screen.getByText(/risk notes/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Protocol-level compliance information. Not legal, regulatory, or financial advice.',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm & sign/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables actions while submitting', () => {
    render(
      <TransactionReviewModal
        details={transferDetailsFixture}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting
      />,
    );

    expect(screen.getByRole('button', { name: /confirming/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /close modal/i })).toBeDisabled();
  });
});
