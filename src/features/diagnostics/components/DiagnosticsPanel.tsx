import React, { useState } from 'react';
import StatusCard from './StatusCard';
import { buildDiagnosticsReport } from '@/lib/diagnostics/buildReport';
import { useWallet } from '@/hooks/useWallet';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { isProviderMocked } from '@/lib/sdk';
import { validateDashboardConfig } from '@/config/validate';

export default function DiagnosticsPanel() {
  const { address, network } = useWallet();
  const { flags } = useFeatureFlags();
  const [copied, setCopied] = useState(false);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || '';
  const contractId = process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID || '';

  const mockActive = isProviderMocked();
  const configResult = validateDashboardConfig();

  const { report: reportData, cards } = buildDiagnosticsReport(
    {
      walletAddress: address,
      walletNetwork: typeof network === 'string' ? network : null,
      flags,
      mockActive,
      rpcUrl,
      contractId,
      sdkVersion: 'Mocked v0.0.0',
    },
    configResult,
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Environment Diagnostics</h2>
        <button
          onClick={handleCopy}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-medium text-sm transition"
        >
          {copied ? 'Copied!' : 'Copy Report'}
        </button>
      </div>

      {/* Mock mode callout — rendered at the top so it's impossible to miss */}
      {mockActive && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span className="font-semibold">Mock provider active.</span>{' '}
          All values below reflect fixture data, not a live environment.
          Set <code className="font-mono text-xs">NEXT_PUBLIC_MOCK_MODE=false</code> to
          switch to the live provider.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <StatusCard
            key={card.title}
            title={card.title}
            value={card.value}
            status={card.status}
          />
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-sm mb-2 text-slate-700">Feature Flags</h3>
        <pre className="bg-slate-50 p-4 rounded-md border border-slate-200 text-sm overflow-x-auto">
          {JSON.stringify(flags, null, 2)}
        </pre>
      </div>
    </div>
  );
}