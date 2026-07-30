import { useMemo } from 'react';
import { FileText, Layers } from 'lucide-react';
import {
  TableSearch,
  TableSortHeader,
  StatusFilter,
  SavedViewManager,
} from '@/components/table';
import { useTableFilters } from '@/hooks/useTableFilters';
import type { IssuanceRequest } from '@/fixtures/issuer';
import { EmptyState } from '@/components/states';
import { StatusBadge } from '@/components/status';
import { statusForIssuanceRequest } from '@/lib/status';

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface IssuanceRequestsTableProps {
  requests: IssuanceRequest[];
}

/**
 * Asset issuance requests table for the Issuer Console.
 *
 * Demonstrates the reusable table filtering pattern on a second feature
 * surface: search, multi-select status filter, sortable columns, and saved
 * views.
 */
export default function IssuanceRequestsTable({
  requests,
}: IssuanceRequestsTableProps) {
  const tableFilters = useTableFilters({ namespace: 'issuance-requests' });

  const visible = useMemo(
    () => tableFilters.applyTo(requests, ['assetName', 'ticker', 'jurisdiction', 'id']),
    [requests, tableFilters.state],
  );

  const statusOptions = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    for (const r of requests) {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    }
    return Object.entries(statusCounts).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count,
    }));
  }, [requests]);

  const activeView = tableFilters.savedViews.find(
    (v) =>
      v.query === tableFilters.state.query &&
      JSON.stringify(v.filters) === JSON.stringify(tableFilters.state.filters) &&
      v.sort.field === tableFilters.state.sort.field &&
      v.sort.direction === tableFilters.state.sort.direction,
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Issuance Requests</h2>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage asset issuance requests. Final minting requires
            on-chain authorization.
          </p>
        </div>
        <SavedViewManager
          views={tableFilters.savedViews}
          activeViewId={activeView?.id ?? null}
          onSave={tableFilters.saveView}
          onLoad={tableFilters.loadView}
          onDelete={tableFilters.deleteView}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="w-full md:w-80">
          <TableSearch
            value={tableFilters.state.query}
            onChange={tableFilters.setQuery}
            placeholder="Search by name, ticker, or jurisdiction…"
          />
        </div>
        <StatusFilter
          label="Status"
          options={statusOptions}
          selected={tableFilters.state.filters['status'] ?? []}
          onToggle={(v) => tableFilters.toggleFilter('status', v)}
        />
        {visible.length !== requests.length && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {visible.length} of {requests.length} request(s)
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="p-2">
                <TableSortHeader
                  label="Request"
                  field="id"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">
                <TableSortHeader
                  label="Asset"
                  field="assetName"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">
                <TableSortHeader
                  label="Ticker"
                  field="ticker"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">
                <TableSortHeader
                  label="Amount"
                  field="amount"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
              <th className="p-2">
                <TableSortHeader
                  label="Jurisdiction"
                  field="jurisdiction"
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
              <th className="p-2">
                <TableSortHeader
                  label="Requested"
                  field="requestedAt"
                  currentSort={tableFilters.state.sort}
                  onSort={tableFilters.setSort}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((req) => (
              <tr
                key={req.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="p-2 font-mono text-xs text-slate-500">{req.id}</td>
                <td className="p-2 font-medium text-slate-800">{req.assetName}</td>
                <td className="p-2 font-mono text-xs text-slate-500">{req.ticker}</td>
                <td className="p-2 text-slate-700">
                  ${formatAmount(req.amount)}
                </td>
                <td className="p-2">
                  <span className="text-xs font-medium text-slate-600">
                    {req.jurisdiction}
                  </span>
                </td>
                <td className="p-2">
                  <StatusBadge status={statusForIssuanceRequest(req.status)} variant="pill" />
                </td>
                <td className="p-2 text-xs text-slate-400">
                  {new Date(req.requestedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="mt-2">
          <EmptyState
            icon={FileText}
            title="No issuance requests"
            description="No requests match the current filters. Try adjusting your search criteria."
            variant="no-data"
            actions={[
              {
                label: 'Clear filters',
                onClick: tableFilters.resetFilters,
                variant: 'secondary',
              },
            ]}
            docsLink={{
              label: 'Learn about asset issuance',
              href: '/docs/asset-issuance',
            }}
          />
        </div>
      )}
    </div>
  );
}
