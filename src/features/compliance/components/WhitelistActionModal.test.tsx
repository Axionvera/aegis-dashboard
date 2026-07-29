import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WhitelistActionModal from './WhitelistActionModal';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';

const ADDRESS = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37';

describe('WhitelistActionModal', () => {
  it('shows operation summary, network, target, expected result, and risk notes before signing', () => {
    render(
      <WhitelistActionModal
        action="add"
        address={ADDRESS}
        note="KYC case ref-001"
        network="TESTNET"
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/add address to kyc whitelist/i)).toBeInTheDocument();
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
    expect(screen.getByText('TESTNET')).toBeInTheDocument();
    expect(screen.getByText('Expected result')).toBeInTheDocument();
    expect(screen.getByText(/eligible to hold and receive/i)).toBeInTheDocument();
    expect(screen.getByText('Risk notes')).toBeInTheDocument();
    expect(screen.getByText(COMPLIANCE_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText('KYC case ref-001')).toBeInTheDocument();
  });

  it('does not call onSubmit until Confirm & Sign', async () => {
    const onSubmit = vi.fn(async () => ({ status: 'SUCCESS', hash: 'mock_tx_hash' }));
    const onClose = vi.fn();

    render(
      <WhitelistActionModal
        action="remove"
        address={ADDRESS}
        network="TESTNET"
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );

    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /confirm & sign/i }));

    await screen.findByText('Transaction confirmed');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('cancels without submitting', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <WhitelistActionModal
        action="add"
        address={ADDRESS}
        network="TESTNET"
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledWith(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('reports success to onClose from the receipt', async () => {
    const onClose = vi.fn();

    render(
      <WhitelistActionModal
        action="add"
        address={ADDRESS}
        network="TESTNET"
        onSubmit={vi.fn(async () => ({ status: 'SUCCESS', hash: 'mock_tx_hash' }))}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm & sign/i }));
    await screen.findByText('Transaction confirmed');

    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it('surfaces a failure receipt when the provider rejects', async () => {
    render(
      <WhitelistActionModal
        action="remove"
        address={ADDRESS}
        network="TESTNET"
        onSubmit={vi.fn(async () => {
          throw new Error('Whitelist update rejected');
        })}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /confirm & sign/i }));

    expect(await screen.findByText('Transaction failed')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/whitelist update rejected/i)).toBeInTheDocument();
    });
  });
});
