/**
 * ConfigErrorScreen
 *
 * Renders when the dashboard's own environment configuration fails
 * validation (see src/config/validate.ts, Issue #8). This is deliberately a
 * hard stop, not a dismissible banner — a misconfigured RPC URL or contract
 * ID could otherwise let a user sign an action against the wrong network or
 * contract without ever realizing it.
 *
 * Only ever shown for "error"-level issues; "warning"-level issues are
 * listed here too for visibility but never block on their own.
 */

import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { ConfigValidationResult, ConfigIssue } from '@/config/validate';

interface ConfigErrorScreenProps {
  result: ConfigValidationResult;
}

function IssueRow({ issue }: { issue: ConfigIssue }) {
  const isError = issue.level === 'error';
  return (
    <li
      className={
        isError
          ? 'flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-slate-700'
          : 'flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-700'
      }
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
      )}
      <span>
        <span className="font-mono font-semibold">{issue.field}</span>: {issue.message}
      </span>
    </li>
  );
}

export default function ConfigErrorScreen({ result }: ConfigErrorScreenProps) {
  const errors = result.issues.filter((issue) => issue.level === 'error');
  const warnings = result.issues.filter((issue) => issue.level === 'warning');

  return (
    <div className="max-w-2xl mx-auto py-20 px-4" role="alert" aria-live="polite">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" aria-hidden="true" />
          <h2 className="mb-1 text-2xl font-bold text-slate-900">Dashboard configuration is invalid</h2>
          <p className="text-slate-600">
            Fix the issues below in your environment configuration before continuing.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-red-700">Errors</h3>
            <ul className="space-y-2">
              {errors.map((issue) => (
                <IssueRow key={issue.field} issue={issue} />
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-amber-700">Warnings</h3>
            <ul className="space-y-2">
              {warnings.map((issue) => (
                <IssueRow key={issue.field} issue={issue} />
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          See docs/config-validation.md for setup instructions, or set{' '}
          <code className="font-mono">NEXT_PUBLIC_MOCK_MODE=&quot;true&quot;</code> for local frontend
          development without real RPC/contract config.
        </p>
      </div>
    </div>
  );
}