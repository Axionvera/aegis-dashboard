import { DashboardRole } from '@/features/auth/types';

export interface WalletRoleFixture {
  address: string;
  role: DashboardRole;
  label: string;
}

export const walletRoleFixtures: WalletRoleFixture[] = [
  {
    address: 'GCFXADMIN00000000000000000000000000000000000000000000',
    role: 'admin',
    label: 'Protocol admin wallet',
  },
  {
    address: 'GCFXISSUER0000000000000000000000000000000000000000000',
    role: 'issuer',
    label: 'Asset issuer wallet',
  },
  {
    address: 'GCFXUSERALICE0000000000000000000000000000000000000000',
    role: 'investor',
    label: 'Investor wallet',
  },
  {
    address: 'GCFXREADONLY00000000000000000000000000000000000000000',
    role: 'read_only',
    label: 'Read-only auditor wallet',
  },
];

export const walletRoleFixtureMap = Object.fromEntries(
  walletRoleFixtures.map((fixture) => [fixture.address, fixture.role])
) as Record<string, DashboardRole>;

export const routeAccessStateFixtures = [
  {
    name: 'portfolio-investor-allowed',
    path: '/portfolio',
    role: 'investor' as DashboardRole,
    walletAddress: walletRoleFixtures[2].address,
    expectedState: 'allowed' as const,
  },
  {
    name: 'admin-page-investor-denied',
    path: '/admin',
    role: 'investor' as DashboardRole,
    walletAddress: walletRoleFixtures[2].address,
    expectedState: 'role_unavailable' as const,
  },
  {
    name: 'transactions-read-only-allowed',
    path: '/transactions',
    role: 'read_only' as DashboardRole,
    walletAddress: walletRoleFixtures[3].address,
    expectedState: 'allowed' as const,
  },
  {
    name: 'portfolio-wallet-required',
    path: '/portfolio',
    role: null,
    walletAddress: null,
    expectedState: 'wallet_required' as const,
  },
];
