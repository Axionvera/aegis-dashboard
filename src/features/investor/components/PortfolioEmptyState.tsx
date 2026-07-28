import { PackageOpen } from 'lucide-react';

export default function PortfolioEmptyState() {
  return (
    <div className="text-center py-16 border border-dashed border-slate-300 rounded-xl bg-slate-50">
      <PackageOpen className="mx-auto text-slate-400 mb-4" size={40} />
      <h3 className="text-lg font-semibold text-slate-800">No holdings yet</h3>
      <p className="text-slate-500 mt-1 max-w-md mx-auto">
        This address does not currently hold any Aegis RWA tokens. Once an issuer mints assets to your wallet, they will appear here.
      </p>
    </div>
  );
}
