import '@/styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Navbar from '@/components/layout/Navbar';
import MockModeBanner from '@/components/MockModeBanner';
import { useWallet } from '@/hooks/useWallet';

function WalletAutoReconnect() {
  const tryAutoReconnect = useWallet((s) => s.tryAutoReconnect);

  useEffect(() => {
    tryAutoReconnect();
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <WalletAutoReconnect />
      <MockModeBanner />
      <Navbar />
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
