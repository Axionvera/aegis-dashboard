import Head from 'next/head';
import { PlusCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import AssetRegistrationForm from '@/components/AssetRegistrationForm';

export default function RegisterAsset() {
  const { address } = useWallet();

  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Wallet Required</h2>
        <p className="text-slate-500 mt-2">
          Connect your Freighter wallet to register a new RWA asset.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Register Asset | Aegis RWA</title>
      </Head>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <PlusCircle className="text-aegis-brand" size={32} strokeWidth={1.5} />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Register New Asset</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Submit metadata for a new real-world asset to be anchored on Stellar.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator />

        {/* Card wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mt-6">
          <AssetRegistrationForm />
        </div>
      </div>
    </>
  );
}

function StepIndicator() {
  const steps = ['Enter Metadata', 'Review', 'Receipt'];
  return (
    <ol className="flex items-center gap-0">
      {steps.map((label, i) => (
        <li key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${i === 0
                  ? 'bg-aegis-brand text-white'
                  : 'bg-slate-200 text-slate-500'}`}
            >
              {i + 1}
            </span>
            <span className="text-xs text-slate-500 mt-1 whitespace-nowrap">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="h-px w-12 bg-slate-200 mx-2 mb-4 shrink-0" />
          )}
        </li>
      ))}
    </ol>
  );
}
