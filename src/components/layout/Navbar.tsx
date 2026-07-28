import Link from 'next/link';
import { useEffect } from 'react';
import { getAccessibleRoutes } from '@/features/auth/routes';
import { useAuthStore } from '@/features/auth/store';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/formatting';
import { Shield } from 'lucide-react';

const prettyRole = (role: string): string =>
  role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function Navbar() {
  const { address, network, isConnecting, connect, disconnect } = useWallet();
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
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2 text-aegis-dark font-bold text-xl">
          <Shield className="text-aegis-brand" />
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

      <div>
        {address ? (
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
              {network}
            </span>
            {isRoleLoading ? (
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">
                Checking role...
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
            className="bg-aegis-brand hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium text-sm transition disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}
