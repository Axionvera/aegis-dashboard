import { useState, type FormEvent } from 'react';
import Head from 'next/head';
import AdminPanel from '@/features/admin/components/AdminPanel';
import FeatureFlagsPanel from '@/features/admin/components/FeatureFlagsPanel';
import WhitelistManager from '@/features/compliance/components/WhitelistManager';
import ComplianceStatusPanel from '@/features/compliance/components/ComplianceStatusPanel';
import RouteGuard from '@/components/RouteGuard';
import { useWallet } from '@/hooks/useWallet';

export default function Admin() {
  const { address } = useWallet();
  const [lookupAddress, setLookupAddress] = useState('');
  const [activeLookup, setActiveLookup] = useState<string | null>(null);

  const handleLookup = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = lookupAddress.trim();
    setActiveLookup(cleaned || null);
  };

  return (
    <RouteGuard path="/admin">
      <Head>
        <title>Admin Dashboard | Aegis RWA</title>
      </Head>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Protocol Administration</h1>
          <AdminPanel />
        </div>

        <WhitelistManager />

        <ComplianceStatusPanel
          address={address}
          title="Connected Wallet Compliance"
        />

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Address Compliance Lookup</h2>
            <p className="text-sm text-slate-500 mt-1">
              Inspect protocol-level compliance status for any address before mint or whitelist actions.
            </p>
          </div>
          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={lookupAddress}
              onChange={(event) => setLookupAddress(event.target.value)}
              placeholder="GABC..."
              className="flex-1 border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
              aria-label="Lookup address"
            />
            <button
              type="submit"
              className="bg-aegis-brand hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition"
            >
              Check Status
            </button>
          </form>
          {activeLookup && (
            <ComplianceStatusPanel
              address={activeLookup}
              title="Lookup Result"
              compact
            />
          )}
        </section>

        <FeatureFlagsPanel />
      </div>
    </RouteGuard>
  );
}
