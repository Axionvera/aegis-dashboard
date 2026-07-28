import Head from 'next/head';
import AdminPanel from '@/components/AdminPanel';
import FeatureFlagsPanel from '@/components/FeatureFlagsPanel';
import { useWallet } from '@/hooks/useWallet';

export default function Admin() {
  const { address } = useWallet();

  // In a real app, verify address against contract admin key
  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Admin Access Required</h2>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Aegis RWA</title>
      </Head>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Protocol Administration</h1>
          <AdminPanel />
        </div>

        <FeatureFlagsPanel />
      </div>
    </>
  );
}