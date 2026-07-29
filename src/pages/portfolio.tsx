import Head from 'next/head';
import PortfolioList from '@/features/investor/components/PortfolioList';
import ComplianceStatusPanel from '@/features/compliance/components/ComplianceStatusPanel';
import RouteGuard from '@/components/RouteGuard';
import { useWallet } from '@/hooks/useWallet';

export default function Portfolio() {
  const { address } = useWallet();

  return (
    <RouteGuard path="/portfolio">
      <Head>
        <title>My Portfolio | Aegis RWA</title>
      </Head>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-slate-900">My Asset Portfolio</h1>
        <ComplianceStatusPanel
          address={address}
          title="Your Compliance Status"
        />
        <PortfolioList />
      </div>
    </RouteGuard>
  );
}
