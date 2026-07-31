import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWallet } from '@/hooks/useWallet';
import { useNetworkGuard, useWalletNetworkWatcher } from './useNetworkGuard';
import { PUBLIC_PASSPHRASE, TESTNET_PASSPHRASE } from './fixtures';

const getNetwork = vi.fn();

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(async () => true),
  isAllowed: vi.fn(async () => true),
  requestAccess: vi.fn(async () => 'GTEST'),
  getPublicKey: vi.fn(async () => 'GTEST'),
  getNetwork: (...args: unknown[]) => getNetwork(...args),
}));

const ADDRESS = 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37';

beforeEach(() => {
  getNetwork.mockReset();
  getNetwork.mockResolvedValue(TESTNET_PASSPHRASE);
  useWallet.setState({ address: null, network: null });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useNetworkGuard', () => {
  it('reports a block when the connected wallet is on another network', () => {
    useWallet.setState({ address: ADDRESS, network: PUBLIC_PASSPHRASE });

    const { result } = renderHook(() => useNetworkGuard('transfer'));

    expect(result.current.status).toBe('mismatch');
    expect(result.current.isBlocked).toBe(true);
  });

  it('re-evaluates when the stored wallet network changes', () => {
    useWallet.setState({ address: ADDRESS, network: PUBLIC_PASSPHRASE });

    const { result } = renderHook(() => useNetworkGuard('transfer'));
    expect(result.current.isBlocked).toBe(true);

    act(() => {
      useWallet.setState({ network: TESTNET_PASSPHRASE });
    });

    expect(result.current.status).toBe('match');
    expect(result.current.isBlocked).toBe(false);
  });
});

describe('useWalletNetworkWatcher', () => {
  it('does not poll while no wallet is connected', async () => {
    renderHook(() => useWalletNetworkWatcher(50));

    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(getNetwork).not.toHaveBeenCalled();
  });

  it('reads the network once on mount for a connected wallet', async () => {
    useWallet.setState({ address: ADDRESS, network: PUBLIC_PASSPHRASE });

    renderHook(() => useWalletNetworkWatcher(10_000));

    await waitFor(() => expect(getNetwork).toHaveBeenCalled());
  });

  it('picks up a network switch the user made in Freighter after connecting', async () => {
    useWallet.setState({ address: ADDRESS, network: 'TESTNET' });
    getNetwork.mockResolvedValue({
      network: 'PUBLIC',
      networkPassphrase: PUBLIC_PASSPHRASE,
    });

    renderHook(() => useWalletNetworkWatcher(20));

    await waitFor(() => expect(useWallet.getState().network).toBe('PUBLIC'));
  });

  it('does not rewrite the store when Freighter returns a fresh object for the same network', async () => {
    useWallet.setState({ address: ADDRESS, network: 'TESTNET' });
    getNetwork.mockResolvedValue({
      network: 'TESTNET',
      networkPassphrase: TESTNET_PASSPHRASE,
    });

    const { result: store } = renderHook(() => useWallet((s) => s.network));
    const valueBefore = store.current;

    renderHook(() => useWalletNetworkWatcher(20));
    await waitFor(() => expect(getNetwork).toHaveBeenCalled());

    // Wait through at least one poll cycle. A reference compare would call set()
    // every time Freighter returns a new object; passphrase compare must not.
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(useWallet.getState().network).toBe(valueBefore);
    expect(useWallet.getState().network).toBe('TESTNET');
  });

  it('refreshes when the tab regains focus, so a switch is caught immediately', async () => {
    useWallet.setState({ address: ADDRESS, network: 'TESTNET' });

    renderHook(() => useWalletNetworkWatcher(10_000));
    await waitFor(() => expect(getNetwork).toHaveBeenCalledTimes(1));

    getNetwork.mockResolvedValue({
      network: 'PUBLIC',
      networkPassphrase: PUBLIC_PASSPHRASE,
    });
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(useWallet.getState().network).toBe('PUBLIC'));
  });

  it('stops polling once the hook unmounts', async () => {
    useWallet.setState({ address: ADDRESS, network: TESTNET_PASSPHRASE });

    const { unmount } = renderHook(() => useWalletNetworkWatcher(20));
    await waitFor(() => expect(getNetwork).toHaveBeenCalled());

    unmount();
    const callsAtUnmount = getNetwork.mock.calls.length;

    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(getNetwork).toHaveBeenCalledTimes(callsAtUnmount);
  });

  it('keeps the last known network when the wallet read fails', async () => {
    useWallet.setState({ address: ADDRESS, network: TESTNET_PASSPHRASE });
    getNetwork.mockRejectedValue(new Error('Freighter is locked'));

    renderHook(() => useWalletNetworkWatcher(10_000));

    await waitFor(() => expect(getNetwork).toHaveBeenCalled());
    expect(useWallet.getState().network).toBe(TESTNET_PASSPHRASE);
  });
});
