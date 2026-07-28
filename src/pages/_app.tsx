import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '@/components/layout/Navbar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        <Component {...pageProps} />
      </main>
    </div>
  );
}