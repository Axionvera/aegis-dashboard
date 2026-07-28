import { describe, expect, it } from 'vitest';
import { routeAccessStateFixtures } from '@/features/auth/fixtures';
import { evaluateRouteAccess } from '@/lib/route-guard';

describe('evaluateRouteAccess', () => {
  it.each(routeAccessStateFixtures)(
    'returns $expectedState for $name',
    ({ path, role, walletAddress, expectedState }) => {
      const result = evaluateRouteAccess({
        path,
        walletAddress,
        role,
        isRoleLoading: false,
      });

      expect(result.state).toBe(expectedState);
    }
  );

  it('returns role_loading while SDK role check is pending', () => {
    const result = evaluateRouteAccess({
      path: '/admin',
      walletAddress: 'GCFXADMIN00000000000000000000000000000000000000000000',
      role: null,
      isRoleLoading: true,
    });

    expect(result.state).toBe('role_loading');
  });

  it('distinguishes admin and investor route access', () => {
    const adminResult = evaluateRouteAccess({
      path: '/admin',
      walletAddress: 'GCFXADMIN00000000000000000000000000000000000000000000',
      role: 'admin',
      isRoleLoading: false,
    });

    const investorResult = evaluateRouteAccess({
      path: '/admin',
      walletAddress: 'GCFXUSERALICE0000000000000000000000000000000000000000',
      role: 'investor',
      isRoleLoading: false,
    });

    expect(adminResult.state).toBe('allowed');
    expect(investorResult.state).toBe('role_unavailable');
  });

  it('restricts compliance page to admin role', () => {
    const adminResult = evaluateRouteAccess({
      path: '/compliance',
      walletAddress: 'GCFXADMIN00000000000000000000000000000000000000000000',
      role: 'admin',
      isRoleLoading: false,
    });

    const investorResult = evaluateRouteAccess({
      path: '/compliance',
      walletAddress: 'GCFXUSERALICE0000000000000000000000000000000000000000',
      role: 'investor',
      isRoleLoading: false,
    });

    expect(adminResult.state).toBe('allowed');
    expect(investorResult.state).toBe('role_unavailable');
  });
});
