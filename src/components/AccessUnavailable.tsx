import Link from 'next/link';
import { RouteAccessResult } from '@/features/auth/types';
import { useWallet } from '@/hooks/useWallet';

interface AccessUnavailableProps {
  access: RouteAccessResult;
}

const prettyRole = (role: string): string =>
  role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function AccessUnavailable({ access }: AccessUnavailableProps) {
  const { connect, isConnecting } = useWallet();

  const title =
    access.state === 'wallet_required'
      ? 'Wallet Connection Required'
      : access.state === 'role_loading'
        ? 'Checking Access'
        : 'Access Unavailable';

  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
        <p className="text-slate-600">{access.message}</p>

        {access.requiredRoles.length > 0 && (
          <p className="text-sm text-slate-500 mt-4">
            Required role(s): {access.requiredRoles.map(prettyRole).join(', ')}
          </p>
        )}

        {access.currentRole && (
          <p className="text-sm text-slate-500 mt-1">
            Detected role: {prettyRole(access.currentRole)}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {access.state === 'wallet_required' && (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-aegis-brand hover:bg-blue-600 text-white px-5 py-2 rounded-md font-medium transition disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {access.state === 'role_unavailable' && (
            <>
              {access.currentRole === 'read_only' ? (
                <Link
                  href="/transactions"
                  className="bg-aegis-brand hover:bg-blue-600 text-white px-5 py-2 rounded-md font-medium transition"
                >
                  View Transactions
                </Link>
              ) : (
                <>
                  <Link
                    href="/portfolio"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2 rounded-md font-medium transition"
                  >
                    Go to Portfolio
                  </Link>
                  <Link
                    href="/transactions"
                    className="bg-aegis-brand hover:bg-blue-600 text-white px-5 py-2 rounded-md font-medium transition"
                  >
                    View Transactions
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-6">
          UI role checks improve safety but do not replace on-chain authorization.
        </p>
      </div>
    </div>
  );
}
