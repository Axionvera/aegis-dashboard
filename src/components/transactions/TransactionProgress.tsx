import { Loader2 } from 'lucide-react';
import type { TransactionPhase } from './types';

interface TransactionProgressProps {
  state: TransactionPhase;
}

const COPY: Record<TransactionPhase, { title: string; description: string }> = {
  signing: {
    title: 'Waiting for signature',
    description: 'Approve the transaction in your wallet to continue.',
  },
  pending: {
    title: 'Submitting to the network',
    description: 'Waiting for confirmation. Keep this window open.',
  },
};

/**
 * Blocking indicator for the two in-flight phases of a transaction. The phase
 * is driven by the caller, so it always reflects what is actually happening.
 */
export default function TransactionProgress({ state }: TransactionProgressProps) {
  const { title, description } = COPY[state];

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3 px-2 py-10 text-center"
    >
      <Loader2 size={32} className="animate-spin text-aegis-brand" aria-hidden="true" />
      <div>
        <p className="font-semibold text-aegis-dark">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
