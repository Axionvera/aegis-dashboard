import { AlertTriangle } from 'lucide-react';
import type { PortfolioFailure } from '@/features/investor/hooks/usePortfolio';
import { SdkErrorRecovery } from '@/features/sdk-recovery';

interface PortfolioErrorStateProps {
  message: string;
  onRetry: () => void;
  /**
   * Classified failure from `usePortfolio`. When present, the recovery plan is
   * rendered instead of the generic retry button so the user sees the step that
   * actually matches the failure (reconnect, wait, report).
   */
  failure?: PortfolioFailure | null;
}

export default function PortfolioErrorState({
  message,
  onRetry,
  failure,
}: PortfolioErrorStateProps) {
  if (failure) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-6">
        <SdkErrorRecovery
          error={failure.error}
          plan={failure.plan}
          handlers={{
            // Loading a portfolio is a read: retrying it can never duplicate
            // state, so every retry action maps straight onto a refetch.
            retry: onRetry,
            retry_with_backoff: onRetry,
          }}
        />
      </div>
    );
  }

  return (
    <div className="text-center py-16 border border-red-200 rounded-xl bg-red-50">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
      <h3 className="text-lg font-semibold text-red-700">Portfolio unavailable</h3>
      <p className="text-red-600 mt-1 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 bg-white border border-red-300 text-red-700 hover:bg-red-100 font-medium px-4 py-2 rounded-lg transition"
      >
        Try again
      </button>
    </div>
  );
}
