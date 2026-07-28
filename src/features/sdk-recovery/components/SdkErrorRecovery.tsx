import { AlertTriangle, ExternalLink, Info, type LucideIcon, ShieldAlert, WifiOff } from 'lucide-react';
import type {
  ClassifiedSdkError,
  RecoveryActionId,
  RecoveryPlan,
  SdkErrorCategory,
} from '@/features/sdk-recovery/types';

interface SdkErrorRecoveryProps {
  error: ClassifiedSdkError;
  plan: RecoveryPlan;
  /**
   * Handlers keyed by action id. An action with no handler is not rendered, so
   * a flow only advertises the steps it can actually perform — a portfolio page
   * has no form to send the user back to, for example.
   */
  handlers: Partial<Record<RecoveryActionId, () => void>>;
  /** Explorer link for `check_explorer`. Rendered instead of a button. */
  explorerUrl?: string | null;
  /** Disables every action while a retry is in flight. */
  isBusy?: boolean;
}

const CATEGORY_ICONS: Partial<Record<SdkErrorCategory, LucideIcon>> = {
  network_unreachable: WifiOff,
  timeout: WifiOff,
  rate_limited: WifiOff,
  compliance_blocked: ShieldAlert,
  indeterminate: Info,
};

/**
 * Renders one failure and its recovery steps.
 *
 * The component is deliberately dumb: `buildRecoveryPlan` decides what may be
 * offered and in what order, this only draws it. That keeps the "is a retry
 * safe here?" rule testable in `recovery.test.ts` rather than in the DOM.
 */
export default function SdkErrorRecovery({
  error,
  plan,
  handlers,
  explorerUrl,
  isBusy = false,
}: SdkErrorRecoveryProps) {
  const Icon = CATEGORY_ICONS[plan.category] ?? AlertTriangle;

  const actions = plan.actions.filter(
    (action) => handlers[action.id] || (action.id === 'check_explorer' && explorerUrl),
  );

  return (
    <div className="space-y-4" role="alert" aria-live="polite">
      <header className="flex gap-3">
        <Icon size={22} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-aegis-dark">{plan.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{plan.summary}</p>
        </div>
      </header>

      {error.detail && (
        <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs break-words text-slate-600">
          {error.detail}
        </p>
      )}

      {plan.complianceNote && (
        <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {plan.complianceNote}
        </p>
      )}

      {error.sideEffectRisk !== 'none' && (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {error.sideEffectRisk === 'confirmed'
            ? 'This request reached the network. Confirm its outcome before submitting another one.'
            : 'This request may have reached the network. Check before submitting another one — a retry from here reuses the original submission key so it cannot be applied twice.'}
        </p>
      )}

      <ul className="space-y-2">
        {actions.map((action) => (
          <li key={action.id}>
            {action.id === 'check_explorer' && explorerUrl && !handlers.check_explorer ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded border border-slate-200 py-2 text-sm font-medium text-aegis-brand transition hover:bg-slate-50"
              >
                {action.label}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ) : (
              <button
                type="button"
                onClick={handlers[action.id]}
                disabled={isBusy}
                title={action.description}
                className={
                  action.primary
                    ? 'w-full rounded bg-aegis-brand py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50'
                    : 'w-full rounded border border-slate-200 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50'
                }
              >
                {action.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
