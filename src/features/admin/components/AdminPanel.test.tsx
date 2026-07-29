import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPanel from '@/features/admin/components/AdminPanel';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

vi.mock('@/hooks/useAegis', () => ({
  useAegis: () => ({
    checkWhitelist: vi.fn(async () => true),
    mint: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({
    address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
    network: 'TESTNET',
    connect: vi.fn(),
  }),
}));

beforeEach(() => {
  useFeatureFlags.getState().resetFlags();
});

describe('AdminPanel — mint flow flag', () => {
  it('renders the guided MintWorkflow when newMintFlow is enabled', () => {
    useFeatureFlags.getState().setFlag('newMintFlow', true);
    render(<AdminPanel />);

    expect(screen.getByRole('heading', { name: /mint rwa asset/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^asset$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /review mint/i })).toBeInTheDocument();
  });

  it('renders the legacy fixed-amount panel when newMintFlow is disabled', () => {
    useFeatureFlags.getState().setFlag('newMintFlow', false);
    render(<AdminPanel />);

    expect(screen.getByRole('heading', { name: /admin controls/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mint asset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /whitelist user/i })).toBeInTheDocument();
  });
});
