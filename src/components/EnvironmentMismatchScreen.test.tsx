import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EnvironmentMismatchScreen from './EnvironmentMismatchScreen';
import type { EnvironmentMismatchResult } from '@/lib/environment';

const disconnect = vi.fn();

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({ disconnect }),
}));

const mismatchResult: EnvironmentMismatchResult = {
  state: 'mismatch',
  title: 'Wrong wallet network',
  message:
    'Your wallet is connected to Stellar Mainnet (PUBLIC), but this dashboard expects Stellar Testnet (TESTNET). Switch your wallet to the correct network before continuing.',
  targetNetwork: 'Stellar Testnet (TESTNET)',
  walletNetwork: 'Stellar Mainnet (PUBLIC)',
};

describe('EnvironmentMismatchScreen', () => {
  it('renders the mismatch title', () => {
    render(<EnvironmentMismatchScreen result={mismatchResult} />);
    expect(screen.getByText('Wrong wallet network')).toBeInTheDocument();
  });

  it('renders the mismatch message', () => {
    render(<EnvironmentMismatchScreen result={mismatchResult} />);
    expect(
      screen.getByText(/Your wallet is connected to Stellar Mainnet/),
    ).toBeInTheDocument();
  });

  it('shows current and expected network', () => {
    render(<EnvironmentMismatchScreen result={mismatchResult} />);
    expect(screen.getByText(/Current network: Stellar Mainnet/)).toBeInTheDocument();
    expect(screen.getByText(/Expected network: Stellar Testnet/)).toBeInTheDocument();
  });

  it('has a disconnect button', () => {
    render(<EnvironmentMismatchScreen result={mismatchResult} />);
    expect(screen.getByRole('button', { name: 'Disconnect wallet' })).toBeInTheDocument();
  });

  it('calls disconnect when the button is clicked', () => {
    render(<EnvironmentMismatchScreen result={mismatchResult} />);
    screen.getByRole('button', { name: 'Disconnect wallet' }).click();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('includes the protocol-level disclaimer', () => {
    render(<EnvironmentMismatchScreen result={mismatchResult} />);
    expect(screen.getByText(/protocol-level network check/)).toBeInTheDocument();
  });
});
