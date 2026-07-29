import { useState } from 'react';
import Head from 'next/head';
import { Plus, X } from 'lucide-react';
import RouteGuard from '@/components/RouteGuard';
import IssuanceRequestsTable from '@/features/issuer/components/IssuanceRequestsTable';
import AssetCreationWizard from '@/features/asset-creation/components/AssetCreationWizard';
import { mockIssuanceRequests, type IssuanceRequest } from '@/fixtures/issuer';
import { useWallet } from '@/hooks/useWallet';

export default function IssuerPage() {
  const { address } = useWallet();
  const [requests, setRequests] = useState<IssuanceRequest[]>(mockIssuanceRequests);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const existingTickers = requests.map((r) => r.ticker);

  const handleCreate = (request: IssuanceRequest) => {
    setRequests((prev) => [request, ...prev]);
  };

  return (
    <RouteGuard path="/issuer">
      <Head>
        <title>Issuer Console | Aegis RWA</title>
      </Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Issuer Console</h1>
          <button
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center gap-2 bg-aegis-dark hover:bg-slate-800 text-white px-4 py-2 rounded font-medium transition"
          >
            <Plus size={16} />
            New asset request
          </button>
        </div>

        <IssuanceRequestsTable requests={requests} />
      </div>

      {isWizardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New RWA asset request"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 pt-16"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsWizardOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setIsWizardOpen(false)}
              aria-label="Close"
              className="absolute -top-2 -right-2 z-10 rounded-full bg-white p-1.5 shadow-sm border border-slate-200 text-slate-500 hover:text-slate-700"
            >
              <X size={16} />
            </button>
            <AssetCreationWizard
              existingTickers={existingTickers}
              requestedBy={address}
              onCreate={handleCreate}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}
    </RouteGuard>
  );
}