import { useState } from 'react';
import { useAegis } from '@/hooks/useAegis';
import Disclaimer from './Disclaimer';

const MINTING_PANEL_DISCLAIMER =
  'Minting records an on-chain issuance event. It does not certify legal ownership, regulatory status, or the existence of any underlying real-world asset.';

export default function AdminPanel() {
  const { mint, isLoading } = useAegis();
  const [address, setAddress] = useState('');

  const handleWhitelist = async () => {
    // In reality, this would call a contract.whitelist(address) method
    alert(`Added ${address} to the protocol allowlist.`);
  };

  const handleMint = async () => {
    await mint(address, 1000);
    alert(`Minted 1000 tokens to: ${address}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6">Admin Controls</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Address</label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
            placeholder="GABC..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="flex space-x-4 pt-2">
          <button
            onClick={handleWhitelist}
            disabled={isLoading || !address}
            className="flex-1 bg-aegis-accent hover:bg-emerald-600 text-white py-2 rounded font-medium transition disabled:opacity-50"
            title="Adds the address to the protocol-level on-chain allowlist."
          >
            Add to Allowlist
          </button>
          <button
            onClick={handleMint}
            disabled={isLoading || !address}
            className="flex-1 bg-aegis-dark hover:bg-slate-800 text-white py-2 rounded font-medium transition disabled:opacity-50"
            title="Records an on-chain issuance event for the given address."
          >
            Mint Asset
          </button>
        </div>

        <Disclaimer variant="modal" text={MINTING_PANEL_DISCLAIMER} className="mt-4" />
      </div>
    </div>
  );
}
