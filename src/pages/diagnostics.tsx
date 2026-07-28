import Head from 'next/head';
import DiagnosticsPanel from '@/features/diagnostics/components/DiagnosticsPanel';

export default function Diagnostics() {
  return (
    <>
      <Head>
        <title>Diagnostics | Aegis RWA</title>
      </Head>
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">System Diagnostics</h1>
          <p className="text-slate-600 mt-2">
            Use this page to verify your environment configuration and export state for support requests.
          </p>
        </div>
        <DiagnosticsPanel />
      </div>
    </>
  );
}
