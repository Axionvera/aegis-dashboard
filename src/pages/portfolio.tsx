import Head from 'next/head';
import PortfolioList from '@/features/investor/components/PortfolioList';
import RouteGuard from '@/components/RouteGuard';

export default function Portfolio() {
  return (
    <RouteGuard path="/portfolio">
      <Head>
        <title>My Portfolio | Aegis RWA</title>
      </Head>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Asset Portfolio</h1>
        <PortfolioList />
      </div>
    </RouteGuard>
  );
}
