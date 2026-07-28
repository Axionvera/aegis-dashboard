import Head from 'next/head';
import Link from 'next/link';
import Disclaimer from '@/components/Disclaimer';

const LANDING_DISCLAIMER =
  'The Aegis protocol enforces configurable on-chain rules but does not guarantee regulatory, legal, or financial compliance. An on-chain token representation does not automatically confer off-chain legal ownership of any underlying real-world asset.';

export default function Home() {
  return (
    <>
      <Head>
        <title>Aegis RWA Dashboard</title>
      </Head>
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Track Real-World Assets <br />
          <span className="text-aegis-brand">on a Configurable On-Chain Protocol.</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          An open-source tokenization framework using Soroban smart contracts for
          configurable on-chain rule enforcement and peer-to-peer asset tracking.
        </p>
        <div className="flex space-x-4 mt-8">
          <Link
            href="/portfolio"
            className="bg-aegis-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition shadow-sm"
          >
            Launch App
          </Link>
          <a
            href="https://github.com/AegisRWA"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm"
          >
            View GitHub
          </a>
        </div>
        <Disclaimer variant="page" text={LANDING_DISCLAIMER} />
      </div>
    </>
  );
}
