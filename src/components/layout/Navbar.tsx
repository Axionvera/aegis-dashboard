import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAccessibleRoutes } from '@/features/auth/routes';
import { useAuthStore } from '@/features/auth/store';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/formatting';
import { Shield, AlertCircle, Menu } from 'lucide-react';
import MobileNav from '@/components/layout/MobileNav';

const prettyRole = (role: string): string =>
  role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function Navbar() {
  const { address, network, isConnecting, connectionError, connect, disconnect } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const role = useAuthStore((state) => state.role);
  const isRoleLoading = useAuthStore((state) => state.isRoleLoading);
  const loadRoleForWallet = useAuthStore((state) => state.loadRoleForWallet);
  const clearRole = useAuthStore((state) => state.clearRole);

  useEffect(() => {
    if (!address) {
      clearRole();
      return;
    }
    loadRoleForWallet(address);
  }, [address, clearRole, loadRoleForWallet]);

  const accessibleRoutes = getAccessibleRoutes(role);

  return (
    <nav
      className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm"
      aria-label="Main navigation"
    >
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2 text-aegis-dark font-bold text-xl">
          <Shield className="text-aegis-brand" aria-hidden="true" />
          <span>Aegis RWA</span>
        </Link>
        <div className="hidden md:flex space-x-4 text-sm font-medium text-slate-600">
          {accessibleRoutes.map((route) => (
            <Link key={route.path} href={route.path} className="hover:text-aegis-brand transition">
              {route.label}
            </Link>
          ))}
          <Link href="/diagnostics" className="hover:text-aegis-brand transition">Diagnostics</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 transition md:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Inline connection error — replaces the removed alert() */}
        {connectionError && !address && (
          <span
            role="alert"
            title={connectionError}
            className="md:flex items-center hidden gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded max-w-xs truncate"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{connectionError}</span>
          </span>
        )}

        {address ? (
          <div className="md:flex items-center space-x-3 hidden">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
              {network}
            </span>
            {isRoleLoading ? (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">
                Checking role…
              </span>
            ) : role ? (
              <span className="text-xs bg-blue-50 text-aegis-brand px-2 py-1 rounded font-medium">
                {prettyRole(role)}
              </span>
            ) : null}
            <button
              onClick={disconnect}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-md font-medium text-sm transition"
            >
              {truncateAddress(address)}
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="bg-aegis-brand hidden md:block hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm transition disabled:opacity-50"
          >
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
      <MobileNav
        isConnected={Boolean(address)}
        isMobileMenuOpen={isMobileMenuOpen}
        address={address ?? undefined}
        disconnect={disconnect}
        isConnecting={isConnecting}
        onConnectWallet={connect}
        onClose={() => setIsMobileMenuOpen(false)}
        routes={accessibleRoutes}
        connectionError={connectionError}
      />
    </nav>
  );
}
