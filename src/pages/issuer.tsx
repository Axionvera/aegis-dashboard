import Head from 'next/head';
import RouteGuard from '@/components/RouteGuard';
import IssuanceRequestsTable from '@/features/issuer/components/IssuanceRequestsTable';
import { mockIssuanceRequests } from '@/fixtures/issuer';

export default function IssuerPage() {
  return (
    <RouteGuard path="/issuer">
      <Head>
        <title>Issuer Console | Aegis RWA</title>
      </Head>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Issuer Console</h1>
        <IssuanceRequestsTable requests={mockIssuanceRequests} />
      </div>
    </RouteGuard>
  );
}
