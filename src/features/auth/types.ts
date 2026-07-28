export type DashboardRole = 'admin' | 'issuer' | 'investor' | 'read_only';

export type RouteAccessState =
  | 'allowed'
  | 'wallet_required'
  | 'role_loading'
  | 'role_unavailable';

export interface RouteAccessConfig {
  path: string;
  label: string;
  requiredRoles: DashboardRole[];
  walletRequired: boolean;
  description: string;
}

export interface RouteAccessContext {
  path: string;
  walletAddress: string | null;
  role: DashboardRole | null;
  isRoleLoading: boolean;
}

export interface RouteAccessResult {
  state: RouteAccessState;
  path: string;
  requiredRoles: DashboardRole[];
  currentRole: DashboardRole | null;
  message: string;
}
