import { FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  type BudgetReviewResult,
  type BudgetReviewState,
  type BudgetBulkAction,
  filterBudgetResults,
  tallyBudgetResults,
  recomputeBudgetSelection,
  toggleBudgetSelection,
  setBudgetSelectionAll,
  applyBudgetBulkAction,
  type BudgetCheck,
} from '@/lib/performanceBudget';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';
import { EmptyState } from '@/components/states';
import {
  TableSearch,
  TableSortHeader,
  StatusFilter,
  SavedViewManager,
} from '@/components/table';
import { useTableFilters } from '@/hooks/useTableFilters';
import type { TransactionResult } from '@/components/transactions/types';

const STATUS_BADGE: Record<
  BudgetReviewResult['status'],
  string
> = {
  compliant: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  breached: 'bg-rose-100 text-rose-800',
  unknown: 'bg-slate-100 text-slate-800',
};

const CHECK_DOT: Record<
  BudgetCheck['result'],
  string
> = {
  pass: 'bg-emerald-500',
  fail: 'bg-rose-500',
  warn: 'bg-amber-500',
  unknown: 'bg-slate-400',
};

const ACTION_LABELS: Record<BudgetBulkAction, string> = {
  approve: 'Approve',
  reject: 'Reject',
  'flag-for-review': 'Flag for review',
  clear: 'Clear selection',
};

function shortId(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 12)}…${id.slice(-4)}`;
}

function StatusBadge({
  status,
}: {
  status: BudgetReviewResult['status'];
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}
    >
      {status}
    </span>
  );
}

export interface PerformanceBudgetPanelProps {
  /** Seed budget review results. Typically loaded from the SDK/contract layer. */
  initialResults: BudgetReviewResult[];
  /** Whether the connected wallet has admin/compliance authority. */
  canAct: boolean;
  /** Optional callback fired after a bulk action is applied. */
  onAction?: (action: BudgetBulkAction, affectedIds: string[]) => void;
}

/**
 * Reusable performance budget review panel.
 *
 * Pure state lives in `src/lib/performanceBudget.ts`; this component
 * only renders and wires user intent. Filtering, sorting, and saved
 * views are provided by the reusable `useTableFilters` hook and
 * table UI components.
 *
 * Safe-by-default: bulk actions are disabled unless rows are selected.
 */
export default function PerformanceBudgetPanel({
  initialResults,
  canAct,
  onAction,
}: PerformanceBudgetPanelProps) {
  const [state, setState] = useState<BudgetReviewState>(() =>
    recomputeBudgetSelection(
      initialResults.map((r) => ({ ...r, selected: false })),
    ),
  );
  const [pendingAction, setPendingAction] = useState<BudgetBulkAction | null>(
    null,
  );

  const tableFilters = useTableFilters({
    namespace: 'performance-budget-review',
  });

  const visible = useMemo(() => {
    return filterBudgetResults(state.results, tableFilters.state.query);
  }, [state.results, tableFilters.state.query]);

  const tally = useMemo(
    () => tallyBudgetResults(state.results),
    [state.results],
  );

  const statusOptions = useMemo(
    () =>
      (
        ['compliant', 'warning', 'breached', 'unknown'] as const
      ).map((s) => ({
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
        count: tally[s],
      })),
    [tally],
  );

  const handleToggle = (id: string) =>
    setState((s) => toggleBudgetSelection(s, id));
  const handleSelectAll = (value: boolean) =>
    setState((s) => setBudgetSelectionAll(s, value));

  const handleAction = (action: BudgetBulkAction) => {
    setState((s) => {
      const affected = s.results
        .filter((x) => x.selected)
        .map((x) => x.budgetId);
      const next = applyBudgetBulkAction(s, action);
      onAction?.(action, affected);
      return next;
    });
  };

  const handleConfirmAction = (action: BudgetBulkAction): TransactionResult => {
    const ids = state.results
      .filter((s) => s.selected)
      .map((s) => s.budgetId);
    handleAction(action);
    setPendingAction(null);
    return {
      status: 'success',
      message: 'Budget review updated',
      detail: `${ACTION_LABELS[action]} applied to ${ids.length} budget result(s).`,
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
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">Performance Budget Review</h2>
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

      <div className="flex flex-col gap-3 mb-4">
        <div className="w-full md:w-80">
          <TableSearch
            value={tableFilters.state.query}
            onChange={tableFilters.setQuery}
            placeholder="Filter by budget ID or name…"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <StatusFilter
            label="Status"
            options={statusOptions}
            selected={tableFilters.state.filters['status'] ?? []}
            onToggle={(v) => tableFilters.toggleFilter('status', v)}
          />
        </div>

        {(tableFilters.state.query ||
          Object.values(tableFilters.state.filters).some(
            (v) => v.length > 0,
          ) ||
          tableFilters.state.sort.direction) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {visible.length} of {state.results.length} budget result(s)
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

      {canAct && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            disabled={state.selectedCount === 0}
            onClick={() => setPendingAction('approve')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Approve selected
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => setPendingAction('reject')}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Reject selected
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => setPendingAction('flag-for-review')}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Flag for review
          </button>
          <button
            disabled={state.selectedCount === 0}
            onClick={() => handleAction('clear')}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded text-sm font-medium disabled:opacity-40"
          >
            Clear selection
          </button>
        </div>
      )}

      {pendingAction && (
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">
            {ACTION_LABELS[pendingAction]} — {state.selectedCount} selected
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {COMPLIANCE_DISCLAIMER}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleConfirmAction(pendingAction)}
              className="bg-aegis-brand hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setPendingAction(null)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded text-sm font-medium transition"
            >
              Cancel
            </button>
          </div>
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
              <th className="p-2">Budget</th>
              <th className="p-2">Status</th>
              <th className="p-2">Checks</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.budgetId}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    aria-label={`Select ${r.budgetId}`}
                    checked={!!r.selected}
                    onChange={() => handleToggle(r.budgetId)}
                  />
                </td>
                <td className="p-2 font-mono" title={r.budgetId}>
                  {shortId(r.budgetId)}
                  {r.meta?.portfolio && (
                    <span className="ml-2 text-xs text-slate-400">
                      {r.meta.portfolio}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  <StatusBadge status={r.status} />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    {r.checks.map((c) => (
                      <span
                        key={c.key}
                        title={`${c.label}: ${c.result}`}
                        className={`inline-block w-2.5 h-2.5 rounded-full ${CHECK_DOT[c.result]}`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-slate-400">
                      {r.checks.length} check(s)
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon={FileText}
                    title="No budget results"
                    description="No budget results match the current filters. Try adjusting your search criteria."
                    variant="no-data"
                    actions={[
                      {
                        label: 'Clear filters',
                        onClick: tableFilters.resetFilters,
                        variant: 'secondary',
                      },
                    ]}
                    docsLink={{
                      label: 'Learn about performance budgets',
                      href: '/docs/performance-budget-review',
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