import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { truncateAddress } from '@/utils/formatting';
import { Shield, AlertCircle } from 'lucide-react';

export default function Navbar() {
  const { address, network, isConnecting, connectionError, connect, disconnect } = useWallet();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm" aria-label="Main navigation">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 text-aegis-dark font-bold text-xl">
            <Shield className="text-aegis-brand" aria-hidden="true" />
            <span>Aegis RWA</span>
          </Link>
          <div className="hidden md:flex space-x-4 text-sm font-medium text-slate-600">
            <Link href="/portfolio" className="hover:text-aegis-brand transition">Portfolio</Link>
            <Link href="/transactions" className="hover:text-aegis-brand transition">Transactions</Link>
            <Link href="/admin" className="hover:text-aegis-brand transition">Admin</Link>
            <Link href="/diagnostics" className="hover:text-aegis-brand transition">Diagnostics</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Inline error — replaces the removed alert() */}
          {connectionError && !address && (
            <span
              role="alert"
              title={connectionError}
              className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded max-w-xs truncate"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{connectionError}</span>
            </span>
          )}

          {address ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                {network}
              </span>
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
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
