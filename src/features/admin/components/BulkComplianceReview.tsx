import { useMemo, useState } from "react";
import {
  type ComplianceReviewState,
  type ComplianceSubject,
  type CheckResult,
  type ComplianceStatus,
  deriveStatus,
  filterSubjects,
  severityRank,
  tallyByStatus,
  recomputeSelection,
  toggleSelection,
  setSelectionAll,
  applyBulkAction,
  type BulkAction,
} from "@/lib/complianceReview";

const STATUS_BADGE: Record<ComplianceStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  review: "bg-sky-100 text-sky-800",
};

const RESULT_DOT: Record<CheckResult, string> = {
  pass: "bg-emerald-500",
  fail: "bg-rose-500",
  warn: "bg-amber-500",
  unknown: "bg-slate-400",
};

function shortId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}>
      {status}
    </span>
  );
}

export interface BulkComplianceReviewProps {
  /** Seed subjects. Typically loaded from the SDK/contract layer. */
  initialSubjects: ComplianceSubject[];
  /** Whether the connected wallet has admin/compliance authority. */
  canAct: boolean;
  /** Optional callback fired after a bulk action is applied. */
  onAction?: (action: BulkAction, affectedIds: string[]) => void;
}

/**
 * Reusable bulk compliance review table.
 * Pure state lives in `src/lib/complianceReview.ts`; this component only
 * renders and wires user intent. Safe-by-default: bulk actions are disabled
 * unless rows are selected.
 */
export default function BulkComplianceReview({
  initialSubjects,
  canAct,
  onAction,
}: BulkComplianceReviewProps) {
  const [state, setState] = useState<ComplianceReviewState>(() =>
    recomputeSelection(initialSubjects.map((s) => ({ ...s, selected: false }))),
  );
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => filterSubjects(state.subjects, query),
    [state.subjects, query],
  );
  const tally = useMemo(() => tallyByStatus(state.subjects), [state.subjects]);

  const handleToggle = (id: string) => setState((s) => toggleSelection(s, id));
  const handleSelectAll = (value: boolean) => setState((s) => setSelectionAll(s, value));

  const handleAction = (action: BulkAction) => {
    setState((s) => {
      const affected = s.subjects.filter((x) => x.selected).map((x) => x.id);
      const next = applyBulkAction(s, action);
      onAction?.(action, affected);
      return next;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Bulk Compliance Review</h2>
          <p className="text-sm text-slate-500 mt-1">
            Protocol-level compliance triage. Not legal, regulatory, or financial advice.
          </p>
        </div>
        <input
          type="text"
          placeholder="Filter by address or jurisdiction…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {(["pending", "approved", "review", "rejected"] as ComplianceStatus[]).map((k) => (
          <span key={k} className={`px-2 py-1 rounded-full font-medium ${STATUS_BADGE[k]}`}>
            {k}: {tally[k]}
          </span>
        ))}
        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          selected: {state.selectedCount}
        </span>
      </div>

      {canAct && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            disabled={state.selectedCount === 0}
            onClick={() => handleAction("approve")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Approve selected
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => handleAction("reject")}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Reject selected
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => handleAction("flag-for-review")}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Flag for review
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => handleAction("clear")}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="p-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={state.allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-2">Subject</th>
              <th className="p-2">Severity</th>
              <th className="p-2">Status</th>
              <th className="p-2">Checks</th>
            </tr>
          </thead>
          <tbody>
            {visible
              .slice()
              .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
              .map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${s.id}`}
                      checked={!!s.selected}
                      onChange={() => handleToggle(s.id)}
                    />
                  </td>
                  <td className="p-2 font-mono" title={s.id}>
                    {shortId(s.id)}
                    {s.meta?.jurisdiction && (
                      <span className="ml-2 text-xs text-slate-400">{s.meta.jurisdiction}</span>
                    )}
                  </td>
                  <td className="p-2 capitalize">{s.severity}</td>
                  <td className="p-2">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {s.checks.map((c) => (
                        <span
                          key={c.key}
                          title={`${c.label}: ${c.result}${c.detail ? ` — ${c.detail}` : ""}`}
                          className={`inline-block w-2.5 h-2.5 rounded-full ${RESULT_DOT[c.result]}`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-slate-400">
                        derived: {deriveStatus(s.checks)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-400">
                  No subjects match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
