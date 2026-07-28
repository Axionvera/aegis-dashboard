import { canAccessRoute, getRouteAccessConfig } from '@/features/auth/routes';
import {
  DashboardRole,
  RouteAccessContext,
  RouteAccessResult,
  RouteAccessState,
} from '@/features/auth/types';

const roleLabel = (role: DashboardRole): string =>
  role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const buildMessage = (
  state: RouteAccessState,
  requiredRoles: DashboardRole[],
  currentRole: DashboardRole | null,
  routeLabel: string
): string => {
  if (state === 'allowed') {
    return `Access granted for ${routeLabel}.`;
  }

  if (state === 'wallet_required') {
    return 'Connect your wallet to access this dashboard section.';
  }

  if (state === 'role_loading') {
    return 'Checking wallet role capabilities...';
  }

  const requiredText = requiredRoles.map(roleLabel).join(', ');
  const currentText = currentRole ? roleLabel(currentRole) : 'none detected';

  return `This section requires ${requiredText} access. Your connected wallet role is ${currentText}.`;
};

export const evaluateRouteAccess = ({
  path,
  walletAddress,
  role,
  isRoleLoading,
}: RouteAccessContext): RouteAccessResult => {
  const route = getRouteAccessConfig(path);

  if (!route) {
    return {
      state: 'allowed',
      path,
      requiredRoles: [],
      currentRole: role,
      message: 'Route is not role restricted.',
    };
  }

  if (route.walletRequired && !walletAddress) {
    return {
      state: 'wallet_required',
      path,
      requiredRoles: route.requiredRoles,
      currentRole: null,
      message: buildMessage('wallet_required', route.requiredRoles, null, route.label),
    };
  }

  if (isRoleLoading) {
    return {
      state: 'role_loading',
      path,
      requiredRoles: route.requiredRoles,
      currentRole: role,
      message: buildMessage('role_loading', route.requiredRoles, role, route.label),
    };
  }

  if (!canAccessRoute(role, route.requiredRoles)) {
    return {
      state: 'role_unavailable',
      path,
      requiredRoles: route.requiredRoles,
      currentRole: role,
      message: buildMessage('role_unavailable', route.requiredRoles, role, route.label),
    };
  }

  return {
    state: 'allowed',
    path,
    requiredRoles: route.requiredRoles,
    currentRole: role,
    message: buildMessage('allowed', route.requiredRoles, role, route.label),
  };
};
