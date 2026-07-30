import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NetworkGuardNotice from './NetworkGuardNotice';
import { evaluateNetworkGuard } from '../networkGuard';
import { PUBLIC_PASSPHRASE, TESTNET_PASSPHRASE } from '../fixtures';
import type { GuardedActionId } from '../types';

const refreshNetwork = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useWallet', () => ({
  useWallet: (selector: (state: { refreshNetwork: typeof refreshNetwork }) => unknown) =>
    selector({ refreshNetwork }),
}));

function guardFor(action: GuardedActionId, passphrase: string) {
  return evaluateNetworkGuard({
    action,
    walletNetwork: { networkPassphrase: passphrase },
    isWalletConnected: true,
    isMockMode: false,
  });
}

describe('NetworkGuardNotice', () => {
  it('renders nothing when the action is allowed', () => {
    const { container } = render(
      <NetworkGuardNotice guard={guardFor('transfer', TESTNET_PASSPHRASE)} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('explains a blocked signing action and names both networks', () => {
    render(<NetworkGuardNotice guard={guardFor('transfer', PUBLIC_PASSPHRASE)} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Wrong wallet network')).toBeInTheDocument();
    expect(screen.getByText(/was not submitted/)).toBeInTheDocument();
    expect(screen.getByText('Stellar Mainnet (PUBLIC)')).toBeInTheDocument();
    expect(screen.getByText('Stellar Testnet (TESTNET)')).toBeInTheDocument();
  });

  it('uses warning copy for a local action instead of blocking copy', () => {
    render(<NetworkGuardNotice guard={guardFor('compliance-update', PUBLIC_PASSPHRASE)} />);

    expect(screen.getByText('Wallet is on a different network')).toBeInTheDocument();
    expect(screen.getByText(/can still proceed/)).toBeInTheDocument();
  });

  it('always carries the protocol-level disclaimer', () => {
    render(<NetworkGuardNotice guard={guardFor('mint', PUBLIC_PASSPHRASE)} />);

    expect(screen.getByText(/protocol-level network check/)).toBeInTheDocument();
  });

  it('re-reads the wallet network when the user rechecks', () => {
    render(<NetworkGuardNotice guard={guardFor('mint', PUBLIC_PASSPHRASE)} />);

    fireEvent.click(screen.getByRole('button', { name: /Recheck network/ }));

    expect(refreshNetwork).toHaveBeenCalled();
  });

  it('hides the recheck button when asked to', () => {
    render(<NetworkGuardNotice guard={guardFor('mint', PUBLIC_PASSPHRASE)} hideRecheck />);

    expect(screen.queryByRole('button', { name: /Recheck network/ })).not.toBeInTheDocument();
  });
});
