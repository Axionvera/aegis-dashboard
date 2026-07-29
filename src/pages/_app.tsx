import '@/styles/globals.css';
import { useEffect, useState, type ReactNode } from 'react';
import type { AppProps } from 'next/app';
import Navbar from '@/components/layout/Navbar';
import MockModeBanner from '@/components/MockModeBanner';
import EnvironmentBanner from '@/components/EnvironmentBanner';
import EnvironmentMismatchScreen from '@/components/EnvironmentMismatchScreen';
import ConfigErrorScreen from '@/components/ConfigErrorScreen';
import { useWallet } from '@/hooks/useWallet';
import { isMockModeEnabled } from '@/config/mockMode';
import { validateDashboardConfig } from '@/config/validate';
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

/**
 * Blocks rendering when the dashboard's own env config (RPC URL, passphrase,
 * contract ID) is malformed. Runs before EnvironmentGuard: there's no point
 * checking a wallet's network against a target network we can't even parse.
 */
function ConfigGuard({ children }: { children: ReactNode }) {
  const result = validateDashboardConfig();

  if (!result.valid) {
    return <ConfigErrorScreen result={result} />;
  }

  return <>{children}</>;
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
      <EnvironmentBanner />
      <MockModeBanner />
      <Navbar />
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        <ConfigGuard>
          <EnvironmentGuard>
            <Component {...pageProps} />
          </EnvironmentGuard>
        </ConfigGuard>
      </main>
    </div>
  );
}