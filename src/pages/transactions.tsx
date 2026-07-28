import Head from 'next/head';
import TransactionHistory from '@/components/TransactionHistory';
import RouteGuard from '@/components/RouteGuard';

export default function TransactionsPage() {
  return (
    <RouteGuard path="/transactions">
      <Head>
        <title>Transaction History | Aegis RWA</title>
      </Head>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Transaction History</h1>
        <TransactionHistory />
      </div>
    </RouteGuard>
  );
}
