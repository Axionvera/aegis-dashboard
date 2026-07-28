import Head from 'next/head';
import TransactionHistory from '@/components/TransactionHistory';
import RouteGuard from '@/components/RouteGuard';
import TransactionFixtureGallery from '@/components/transactions/TransactionFixtureGallery';

export default function TransactionsPage() {
  return (
    <RouteGuard path="/transactions">
      <Head>
        <title>Transaction History | Aegis RWA</title>
      </Head>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Transaction History</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Review the live history feed and the contributor fixture gallery for transaction
            review, progress, and receipt states.
          </p>
        </div>

        <TransactionFixtureGallery />
        <TransactionHistory />
      </div>
    </RouteGuard>
  );
}
