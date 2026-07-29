import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import {
  type ComplianceReviewState,
  type ComplianceSubject,
  type CheckResult,
  type ComplianceStatus,
  type ReviewSeverity,
  deriveStatus,
  filterSubjects,
  severityRank,
  tallyByStatus,
  recomputeSelection,
  toggleSelection,
  setSelectionAll,
  applyBulkAction,
  COMPLIANCE_DISCLAIMER,
  type BulkAction,
} from "@/lib/complianceReview";
import { EmptyState } from "@/components/states";
import {
  TableSearch,
  TableSortHeader,
  StatusFilter,
  SavedViewManager,
} from "@/components/table";
import { useTableFilters } from "@/hooks/useTableFilters";
import type { SortState } from "@/hooks/useTableFilters";
import ComplianceUpdateModal, { ACTION_LABELS } from "./ComplianceUpdateModal";
import type { TransactionResult } from "@/components/transactions/types";
import { useWallet } from "@/hooks/useWallet";

const STATUS_BADGE: Record<ComplianceStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  review: "bg-sky-100 text-sky-800",
};

const SEVERITY_STYLES: Record<ReviewSeverity, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-700",
  critical: "bg-red-100 text-red-800",
};

const RESULT_DOT: Record<CheckResult, string> = {
  pass: "bg-emerald-500",
  fail: "bg-rose-500",
  warn: "bg-amber-500",
  unknown: "bg-slate-400",
};

/** Actions that require a confirmation modal before applying. */
const ACTIONS_WITH_CONFIRMATION: BulkAction[] = ["approve", "reject", "flag-for-review"];

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
 *
 * Pure state lives in `src/lib/complianceReview.ts`; this component only
 * renders and wires user intent. Filtering, sorting, and saved views are
 * provided by the reusable `useTableFilters` hook and table UI components.
 *
 * Safe-by-default: bulk actions are disabled unless rows are selected.
 */
export default function BulkComplianceReview({
  initialSubjects,
  canAct,
  onAction,
}: BulkComplianceReviewProps) {
  const { network } = useWallet();
  const [state, setState] = useState<ComplianceReviewState>(() =>
    recomputeSelection(initialSubjects.map((s) => ({ ...s, selected: false }))),
  );
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);

  /* ── Reusable table filters ── */
  const tableFilters = useTableFilters({ namespace: "bulk-compliance-review" });

  const visible = useMemo(() => {
    // Start with the existing local query-based filter for backward compat
    // but route it through the new hook.
    return tableFilters.applyTo(state.subjects, ["id", "meta.jurisdiction"] as any);
  }, [state.subjects, tableFilters.state]);

  // Also apply the original local filterSubjects for parity with old code
  const visibleSubjects = useMemo(
    () => filterSubjects(state.subjects, tableFilters.state.query),
    [state.subjects, tableFilters.state.query],
  );

  const tally = useMemo(() => tallyByStatus(state.subjects), [state.subjects]);

  const statusOptions = useMemo(
    () =>
      (["pending", "approved", "rejected", "review"] as ComplianceStatus[]).map((s) => ({
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
        count: tally[s],
      })),
    [tally],
  );

  const severityOptions = useMemo(
    () =>
      (["low", "medium", "high", "critical"] as ReviewSeverity[]).map((s) => ({
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
      })),
    [],
  );

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

  const handleConfirmAction = (action: BulkAction): TransactionResult => {
    const ids = state.subjects.filter((s) => s.selected).map((s) => s.id);
    handleAction(action);
    setPendingAction(null);
    return {
      status: "success",
      message: "Compliance update applied",
      detail: `${ACTION_LABELS[action]} applied to ${ids.length} subject(s).`,
    };
  };

  const activeView = tableFilters.savedViews.find(
    (v) =>
      v.query === tableFilters.state.query &&
      JSON.stringify(v.filters) === JSON.stringify(tableFilters.state.filters) &&
      v.sort.field === tableFilters.state.sort.field &&
      v.sort.direction === tableFilters.state.sort.direction,
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      {/* ── Header row ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Bulk Compliance Review</h2>
          <p className="text-sm text-slate-500 mt-1">
            {COMPLIANCE_DISCLAIMER}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SavedViewManager
            views={tableFilters.savedViews}
            activeViewId={activeView?.id ?? null}
            onSave={tableFilters.saveView}
            onLoad={tableFilters.loadView}
            onDelete={tableFilters.deleteView}
          />
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="w-full md:w-80">
          <TableSearch
            value={tableFilters.state.query}
            onChange={tableFilters.setQuery}
            placeholder="Filter by address or jurisdiction…"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <StatusFilter
            label="Status"
            options={statusOptions}
            selected={tableFilters.state.filters["status"] ?? []}
            onToggle={(v) => tableFilters.toggleFilter("status", v)}
          />
          <StatusFilter
            label="Severity"
            options={severityOptions}
            selected={tableFilters.state.filters["severity"] ?? []}
            onToggle={(v) => tableFilters.toggleFilter("severity", v)}
          />
        </div>

        {/* Active filter summary */}
        {(tableFilters.state.query ||
          Object.values(tableFilters.state.filters).some((v) => v.length > 0) ||
          tableFilters.state.sort.direction) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {visibleSubjects.length} of {state.subjects.length} subject(s)
              {tableFilters.state.sort.direction &&
                ` · sorted by ${tableFilters.state.sort.field}`}
            </span>
            <button
              type="button"
              onClick={tableFilters.resetFilters}
              className="text-xs text-aegis-brand hover:text-blue-700 underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* ── Bulk action bar ── */}
      {canAct && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            disabled={state.selectedCount === 0}
            onClick={() => setPendingAction("approve")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Approve selected
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => setPendingAction("reject")}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Reject selected
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => setPendingAction("flag-for-review")}
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

      {/* ── Compliance update review modal ── */}
      {pendingAction && (
        <ComplianceUpdateModal
          subjects={state.subjects.filter((s) => s.selected)}
          action={pendingAction}
          network={network ?? undefined}
          onConfirm={() => handleConfirmAction(pendingAction)}
          onClose={() => setPendingAction(null)}
        />
      )}

      {/* ── Table ── */}
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
              <th className="p-2">
                <TableSortHeader
                  label="Subject"
                  field="id"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">
                <TableSortHeader
                  label="Severity"
                  field="severity"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">
                <TableSortHeader
                  label="Status"
                  field="status"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">Checks</th>
            </tr>
          </thead>
          <tbody>
            {visibleSubjects.map((s) => (
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
                <td className="p-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLES[s.severity]}`}>
                    {s.severity}
                  </span>
                </td>
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
            {visibleSubjects.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={FileText}
                    title="No compliance records"
                    description="No compliance records match the current filters. Try adjusting your search criteria."
                    variant="no-data"
                    actions={[
                      {
                        label: 'Clear filters',
                        onClick: tableFilters.resetFilters,
                        variant: 'secondary',
                      },
                    ]}
                    docsLink={{
                      label: 'Learn about KYC bulk import',
                      href: '/docs/kyc-bulk-import',
                    }}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
