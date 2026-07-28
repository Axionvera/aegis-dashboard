import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '@/components/Navbar';
import Disclaimer from '@/components/Disclaimer';

const GLOBAL_DISCLAIMER =
  'Aegis provides an on-chain ledger protocol only. This application is not a broker, exchange, custody provider, or financial institution, and does not provide legal, tax, investment, or financial advice. Protocol-enforced rules (including address allowlists) are software-level mechanisms and do not constitute, guarantee, or substitute for multi-jurisdictional legal compliance, KYC/AML verification, securities registration, or transfer restrictions under any applicable law. Balances and metadata shown reflect tokenized on-chain accounting; off-chain asset reality, legal ownership, and physical custody may differ. Users are solely responsible for determining the legality of their use of this software in their jurisdiction.';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        <Component {...pageProps} />
        <Disclaimer variant="footer" text={GLOBAL_DISCLAIMER} />
      </main>
    </div>
  );
}
