/**
 * MockModeBanner
 *
 * A persistent, visually prominent warning that renders at the top of every
 * page whenever mock mode is active. Its sole purpose is to make the mock
 * state unmistakable — no developer should ever mistake fixture data for real
 * on-chain state.
 *
 * This component renders nothing when mock mode is off, so it is always safe
 * to include unconditionally in _app.tsx.
 *
 * Design choices:
 * - Amber background (warning, not error) — the app still works, data is just fake.
 * - Dismissible within the session — lets contributors collapse it once they've
 *   acknowledged it. State is NOT persisted; it resets on page reload by design.
 * - Fixed sticky top bar so it stays visible on scroll.
 * - aria-live="polite" so screen readers announce it without interrupting.
 */

import { useState } from 'react';
import { AlertTriangle, X, FlaskConical } from 'lucide-react';
import { isProviderMocked } from '@/lib/sdk';

export default function MockModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Only render when the mock provider is actually active.
  if (!isProviderMocked() || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-400 px-4 py-2.5 text-amber-900 shadow-md"
    >
      {/* Left: icon + message */}
      <div className="flex items-center gap-2 min-w-0">
        <FlaskConical
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <AlertTriangle
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold leading-snug truncate">
          <span className="font-bold">MOCK MODE ACTIVE</span>
          {' — '}
          <span className="font-normal">
            All data shown is synthetic fixture data. No real contracts are being
            called. Do not treat any balances, compliance decisions, or transaction
            outcomes as real.
          </span>
        </p>
      </div>

      {/* Right: dismiss button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss mock mode warning"
        className="shrink-0 rounded p-0.5 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
