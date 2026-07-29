import { useState } from "react";
import { useAegis } from "@/hooks/useAegis";

export default function AdminPanel() {
  // The success state should be used to display a success message/modal after minting or whitelisting instead of an alert. This is a better UX practice.
  const { mint, checkWhitelist, isLoading, error, success } = useAegis();
  const [address, setAddress] = useState("");

  const handleWhitelist = async () => {
    // In reality, this would call a contract.whitelist(address) method
    alert(`Whitelisted: ${address}`);
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Target Address
          </label>
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
          >
            Whitelist User
          </button>
          <button
            onClick={handleMint}
            disabled={isLoading || !address}
            className="flex-1 bg-aegis-dark hover:bg-slate-800 text-white py-2 rounded font-medium transition disabled:opacity-50"
          >
            {isLoading ? "Minting..." : "Mint Asset"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
