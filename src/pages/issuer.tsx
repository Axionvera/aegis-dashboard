import Head from 'next/head';
import RouteGuard from '@/components/RouteGuard';

export default function IssuerPage() {
  return (
    <RouteGuard path="/issuer">
      <Head>
        <title>Issuer Console | Aegis RWA</title>
      </Head>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Issuer Console</h1>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Asset Issuance Workspace</h2>
          <p className="text-slate-600">
            Issuer wallets can manage asset registration workflows and issuance requests from this
            section. Contract-level authorization still enforces final permissions.
          </p>
        </div>
      </div>
    </RouteGuard>
  );
}
