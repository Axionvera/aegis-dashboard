import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useWallet } from '@/hooks/useWallet';
import { useAegis } from '@/hooks/useAegis';
import OnboardingEligibilityPanel from '@/features/investor/OnboardingEligibilityPanel';
import { useAuthStore } from '@/features/auth/store';
import type { OnboardingEligibilityInput } from '@/lib/eligibility';

export default function OnboardingPage() {
  const { address, network, connect, isConnecting } = useWallet();
  const { checkWhitelist, isLoading } = useAegis();
  const role = useAuthStore((state) => state.role);
  const loadRoleForWallet = useAuthStore((state) => state.loadRoleForWallet);
  const [kycStatus, setKycStatus] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      setKycStatus(undefined);
      return;
    }

    loadRoleForWallet(address);

    let cancelled = false;
    checkWhitelist(address)
      .then((result) => {
        if (!cancelled) setKycStatus(result);
      })
      .catch(() => {
        if (!cancelled) setKycStatus(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [address, checkWhitelist, loadRoleForWallet]);

  if (!address) {
    return (
      <>
        <Head>
          <title>Onboarding Eligibility | Aegis RWA</title>
        </Head>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Onboarding Eligibility</h1>
          <div className="text-center py-16 border border-slate-200 rounded-xl bg-white shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-3">Wallet Connection Required</h2>
            <p className="text-slate-600 mb-6">
              Connect your wallet to check whether this address is eligible to onboard to the Aegis platform.
            </p>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-aegis-brand hover:bg-blue-600 text-white px-5 py-2 rounded-md font-medium transition disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </>
    );
  }

  const input: OnboardingEligibilityInput = {
    walletOnSupportedNetwork: Boolean(network),
    kycCompleted: kycStatus,
    alreadyOnboarded: role === 'investor' || role === 'admin' || role === 'issuer',
    serviceAvailable: !isLoading,
  };

  return (
    <>
      <Head>
        <title>Onboarding Eligibility | Aegis RWA</title>
      </Head>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Onboarding Eligibility</h1>
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Checking onboarding eligibility…</p>
          </div>
        ) : (
          <OnboardingEligibilityPanel input={input} />
        )}
        <p className="text-xs text-slate-400 mt-6 leading-relaxed">
          Onboarding eligibility reflects protocol-level compliance information as of the last successful check.
          It is provided for informational purposes only and does not constitute legal, regulatory, or financial advice.
          The on-chain contract is the authoritative source of whitelist and compliance state.
        </p>
      </div>
    </>
  );
}
