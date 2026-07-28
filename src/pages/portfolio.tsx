import Head from 'next/head';
import PortfolioList from '@/components/PortfolioList';
import Disclaimer from '@/components/Disclaimer';
import { useWallet } from '@/hooks/useWallet';

const PORTFOLIO_DISCLAIMER =
  'Balances shown reflect strictly on-chain token accounting for the connected wallet. Off-chain asset reality, legal rights, custody arrangements, and the existence, value, or status of any underlying real-world asset may differ and are not represented, warranted, or verified by this protocol. Aegis does not provide investment, legal, or tax advice.';

export default function Portfolio() {
  const { address } = useWallet();

  if (!address) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Please Connect Your Wallet</h2>
        <p className="text-slate-500 mt-2">You need to connect Freighter to view your on-chain token portfolio.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Portfolio | Aegis RWA</title>
      </Head>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My On-Chain Token Portfolio</h1>
        <PortfolioList />
        <Disclaimer variant="page" text={PORTFOLIO_DISCLAIMER} />
      </div>
    </>
  );
}
