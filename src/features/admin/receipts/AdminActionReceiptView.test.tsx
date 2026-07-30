import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminActionReceiptView from './AdminActionReceiptView';
import {
  assetRegistrationReceiptFixture,
  mintReceiptFixture,
  whitelistRemoveReceiptFixture,
} from './fixtures';

describe('AdminActionReceiptView', () => {
  it('shows status, operation, target, hash, explorer link, and next action', () => {
    const onNextAction = vi.fn();
    const onClose = vi.fn();

    render(
      <AdminActionReceiptView
        receipt={mintReceiptFixture}
        onNextAction={onNextAction}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/mint · success/i)).toBeInTheDocument();
    expect(screen.getByText('Mint')).toBeInTheDocument();
    expect(screen.getByText(mintReceiptFixture.target)).toBeInTheDocument();
    expect(screen.getByText(/b9d0e\.\.\.4d5e/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /view on stellar expert/i }),
    ).toHaveAttribute(
      'href',
      mintReceiptFixture.explorerUrl,
    );

    fireEvent.click(screen.getByRole('button', { name: /mint another/i }));
    expect(onNextAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows failure status and missing-hash limitation', () => {
    render(
      <AdminActionReceiptView
        receipt={whitelistRemoveReceiptFixture}
        onNextAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/whitelist · failed/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/did not return a transaction hash/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /review action/i }),
    ).toBeInTheDocument();
  });

  it('explains local asset-registration receipt limitations', () => {
    render(
      <AdminActionReceiptView
        receipt={assetRegistrationReceiptFixture}
        onNextAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/asset registration · success/i)).toBeInTheDocument();
    expect(screen.getByText('ISS-005')).toBeInTheDocument();
    expect(screen.getByText(/local issuance request/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create another/i }),
    ).toBeInTheDocument();
  });
});
