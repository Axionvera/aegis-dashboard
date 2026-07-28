import React, { useState } from 'react';
import StatusCard from './StatusCard';
import { redactUrl, redactContractId } from '@/lib/diagnostics/redact';
import { useWallet } from '@/hooks/useWallet';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export default function DiagnosticsPanel() {
  const { address, network } = useWallet();
  const { flags } = useFeatureFlags();
  const [copied, setCopied] = useState(false);

  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || '';
  const contractId = process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID || '';
  
  const redactedRpc = redactUrl(rpcUrl);
  const redactedContract = redactContractId(contractId);
  
  const reportData = {
    timestamp: new Date().toISOString(),
    sdkVersion: 'Mocked v0.0.0', // Hardcoded as requested
    rpc: redactedRpc,
    contract: redactedContract,
    wallet: address ? redactContractId(address) : 'Not connected',
    network: network || 'Not connected',
    flags: flags,
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard 
          title="RPC URL" 
          value={redactedRpc} 
          status={rpcUrl ? 'ok' : 'error'} 
        />
        <StatusCard 
          title="Contract ID" 
          value={redactedContract} 
          status={contractId ? 'ok' : 'error'} 
        />
        <StatusCard 
          title="SDK Version" 
          value={reportData.sdkVersion} 
          status="warning" 
        />
        <StatusCard 
          title="Wallet Address" 
          value={reportData.wallet} 
          status={address ? 'ok' : 'unknown'} 
        />
        <StatusCard 
          title="Wallet Network" 
          value={reportData.network} 
          status={network ? 'ok' : 'unknown'} 
        />
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
