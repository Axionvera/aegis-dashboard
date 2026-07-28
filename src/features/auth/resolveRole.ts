import { walletRoleFixtureMap } from '@/features/auth/fixtures';
import { DashboardRole } from '@/features/auth/types';

const inferRoleFromAddress = (address: string): DashboardRole | null => {
  const fixtureRole = walletRoleFixtureMap[address];
  if (fixtureRole) return fixtureRole;

  const normalized = address.toUpperCase();
  if (normalized.includes('ADMIN')) return 'admin';
  if (normalized.includes('ISSUER')) return 'issuer';
  if (normalized.includes('READ')) return 'read_only';
  if (address.startsWith('G') && address.length > 50) return 'investor';

  return null;
};

/**
 * Mock SDK role lookup. In production this would call @aegis/sdk capability checks.
 */
export const resolveWalletRole = async (address: string): Promise<DashboardRole | null> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return inferRoleFromAddress(address);
};
