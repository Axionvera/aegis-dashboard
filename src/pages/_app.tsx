import '@/styles/globals.css';
import { useEffect, useState, type ReactNode } from 'react';
import type { AppProps } from 'next/app';
import Navbar from '@/components/layout/Navbar';
import MockModeBanner from '@/components/MockModeBanner';
import EnvironmentMismatchScreen from '@/components/EnvironmentMismatchScreen';
import { useWallet } from '@/hooks/useWallet';
import { isMockModeEnabled } from '@/config/mockMode';
import { evaluateEnvironmentMismatch, type EnvironmentMismatchResult } from '@/lib/environment';

function WalletAutoReconnect() {
  const tryAutoReconnect = useWallet((s) => s.tryAutoReconnect);

  useEffect(() => {
    tryAutoReconnect();
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function EnvironmentGuard({ children }: { children: ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<EnvironmentMismatchResult | null>(null);
  const address = useWallet((s) => s.address);
  const network = useWallet((s) => s.network);

  useEffect(() => {
    if (isMockModeEnabled()) {
      setBlocked(false);
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      const res = evaluateEnvironmentMismatch(network, address !== null);
      setBlocked(res.state === 'mismatch');
      setResult(res);
    }, 100);
    return () => clearTimeout(timer);
  }, [address, network]);

  if (blocked && result) {
    return <EnvironmentMismatchScreen result={result} />;
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <WalletAutoReconnect />
      <MockModeBanner />
      <Navbar />
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        <EnvironmentGuard>
          <Component {...pageProps} />
        </EnvironmentGuard>
      </main>
    </div>
  );
}
