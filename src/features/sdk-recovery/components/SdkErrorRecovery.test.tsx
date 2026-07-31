import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { classifySdkError } from '@/features/sdk-recovery/classify';
import SdkErrorRecovery from '@/features/sdk-recovery/components/SdkErrorRecovery';
import { getSdkErrorFixture } from '@/features/sdk-recovery/fixtures';
import { buildRecoveryPlan } from '@/features/sdk-recovery/recovery';

const renderFixture = (
  fixtureId: string,
  props: Partial<React.ComponentProps<typeof SdkErrorRecovery>> = {},
) => {
  const fixture = getSdkErrorFixture(fixtureId);
  const error = classifySdkError(fixture.failure, fixture.context);
  const plan = buildRecoveryPlan(error);

  render(
    <SdkErrorRecovery
      error={error}
      plan={plan}
      handlers={{ retry: vi.fn(), retry_with_backoff: vi.fn(), dismiss: vi.fn(), ...props.handlers }}
      {...props}
    />,
  );

  return { error, plan };
};

describe('SdkErrorRecovery', () => {
  it('announces the failure to assistive technology', () => {
    renderFixture('signature-declined');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Signature declined')).toBeInTheDocument();
  });

  it('only renders actions the caller can handle', () => {
    renderFixture('wallet-locked', { handlers: { retry: vi.fn() } });

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect wallet' })).not.toBeInTheDocument();
  });

  it('invokes the handler for the chosen action', () => {
    const retry = vi.fn();
    renderFixture('signature-declined', { handlers: { retry } });

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('disables every action while a retry is in flight', () => {
    renderFixture('signature-declined', { isBusy: true });
    screen
      .getAllByRole('button')
      .forEach((button) => expect(button).toBeDisabled());
  });

  it('warns when the request may already have reached the network', () => {
    renderFixture('timeout');
    expect(screen.getByText(/may have reached the network/i)).toBeInTheDocument();
  });

  it('states plainly when a request definitely reached the network', () => {
    renderFixture('indeterminate-hash', { explorerUrl: 'https://stellar.expert/tx/abc' });
    expect(screen.getByText(/reached the network\./i)).toBeInTheDocument();
  });

  it('does not warn about side effects when nothing was submitted', () => {
    renderFixture('signature-declined');
    expect(screen.queryByText(/reached the network/i)).not.toBeInTheDocument();
  });

  it('renders the explorer link as a safe external link', () => {
    renderFixture('indeterminate-hash', { explorerUrl: 'https://stellar.expert/tx/abc' });

    const link = screen.getByRole('link', { name: /check the explorer/i });
    expect(link).toHaveAttribute('href', 'https://stellar.expert/tx/abc');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('omits the explorer link when there is no URL to link to', () => {
    renderFixture('indeterminate-hash');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the compliance note without offering a retry', () => {
    renderFixture('compliance-blocked', {
      handlers: { review_input: vi.fn(), contact_support: vi.fn(), dismiss: vi.fn() },
    });

    expect(screen.getByText(/not legal or financial advice/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|try again/i })).not.toBeInTheDocument();
  });

  it('renders the redacted detail rather than the raw error text', () => {
    renderFixture('rpc-5xx');
    expect(screen.getByText(/Service Unavailable/)).toBeInTheDocument();
  });
});
