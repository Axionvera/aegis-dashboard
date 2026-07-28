import Head from 'next/head';
import AdminPanel from '@/features/admin/components/AdminPanel';
import FeatureFlagsPanel from '@/features/admin/components/FeatureFlagsPanel';
import RouteGuard from '@/components/RouteGuard';

export default function Admin() {
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

        <FeatureFlagsPanel />
      </div>
    </RouteGuard>
  );
}
