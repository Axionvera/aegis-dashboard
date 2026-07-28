import Head from 'next/head';
import TransactionHistory from '@/components/TransactionHistory';
import { useWallet } from '@/hooks/useWallet';

export default function TransactionsPage() {
  const { address } = useWallet();

  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Please Connect Your Wallet</h2>
        <p className="text-slate-500 mt-2">Connect Freighter to inspect transaction history.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Transaction History | Aegis RWA</title>
      </Head>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Transaction History</h1>
        <TransactionHistory />
      </div>
    </>
  );
}
