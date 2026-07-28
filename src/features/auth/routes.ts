import { DashboardRole, RouteAccessConfig } from '@/features/auth/types';

export const dashboardRoutes: RouteAccessConfig[] = [
  {
    path: '/portfolio',
    label: 'Portfolio',
    requiredRoles: ['investor', 'issuer', 'admin'],
    walletRequired: true,
    description: 'Investor portfolio and asset transfer workflows.',
  },
  {
    path: '/transactions',
    label: 'Transactions',
    requiredRoles: ['investor', 'issuer', 'admin', 'read_only'],
    walletRequired: true,
    description: 'Audit-oriented transaction history and activity feed.',
  },
  {
    path: '/issuer',
    label: 'Issuer',
    requiredRoles: ['issuer', 'admin'],
    walletRequired: true,
    description: 'Asset registration and issuance controls.',
  },
  {
    path: '/admin',
    label: 'Admin',
    requiredRoles: ['admin'],
    walletRequired: true,
    description: 'Protocol administration and privileged operations.',
  },
  {
    path: '/compliance',
    label: 'Compliance',
    requiredRoles: ['admin'],
    walletRequired: true,
    description: 'Bulk compliance review for admin operators.',
  },
];

export const getRouteAccessConfig = (path: string): RouteAccessConfig | undefined =>
  dashboardRoutes.find((route) => route.path === path);

export const getAccessibleRoutes = (role: DashboardRole | null): RouteAccessConfig[] => {
  if (!role) return [];

  return dashboardRoutes.filter((route) => route.requiredRoles.includes(role));
};

export const canAccessRoute = (
  role: DashboardRole | null,
  requiredRoles: DashboardRole[]
): boolean => {
  if (!role) return false;
  return requiredRoles.includes(role);
};
