import { describe, expect, it } from 'vitest';
import { walletRoleFixtures } from '@/features/auth/fixtures';
import { resolveWalletRole } from '@/features/auth/resolveRole';
import { getAccessibleRoutes } from '@/features/auth/routes';

describe('resolveWalletRole', () => {
  it.each(walletRoleFixtures)('resolves $label to $role', async ({ address, role }) => {
    await expect(resolveWalletRole(address)).resolves.toBe(role);
  });

  it('returns null for unsupported wallet addresses', async () => {
    await expect(resolveWalletRole('INVALID')).resolves.toBeNull();
  });
});

describe('getAccessibleRoutes', () => {
  it('returns investor routes but not admin routes for investor role', () => {
    const routes = getAccessibleRoutes('investor');
    const paths = routes.map((route) => route.path);

    expect(paths).toContain('/portfolio');
    expect(paths).not.toContain('/admin');
  });

  it('returns privileged routes for admin role', () => {
    const routes = getAccessibleRoutes('admin');
    const paths = routes.map((route) => route.path);

    expect(paths).toContain('/admin');
    expect(paths).toContain('/portfolio');
    expect(paths).toContain('/issuer');
  });
});
