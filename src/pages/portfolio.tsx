import Head from 'next/head';
import PortfolioList from '@/features/investor/components/PortfolioList';
import { useWallet } from '@/hooks/useWallet';

export default function Portfolio() {
  const { address } = useWallet();

  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Please Connect Your Wallet</h2>
        <p className="text-slate-500 mt-2">You need to connect Freighter to view your RWA portfolio.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Portfolio | Aegis RWA</title>
      </Head>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Asset Portfolio</h1>
        <PortfolioList />
      </div>
    </>
  );
}