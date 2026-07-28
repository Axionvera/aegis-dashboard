import { useMemo, useState } from 'react';
import {
  applyTransactionFilters,
  defaultTransactionHistoryFilters,
  TRANSACTION_OPERATIONS,
  TRANSACTION_STATUSES,
  TransactionHistoryFilters,
  TransactionOperation,
  TransactionStatus,
  useTransactionHistoryStore,
} from '@/features/transactions';
import { formatTimestamp, truncateAddress } from '@/utils/formatting';

const prettyLabel = (value: string): string =>
  value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const statusClasses: Record<TransactionStatus, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  unknown: 'bg-slate-100 text-slate-600',
};

interface ToggleChipsProps<T extends string> {
  selected: T[];
  options: T[];
  onToggle: (value: T) => void;
}

function ToggleChips<T extends string>({ selected, options, onToggle }: ToggleChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              isSelected
                ? 'bg-aegis-dark text-white border-aegis-dark'
                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
            }`}
          >
            {prettyLabel(option)}
          </button>
        );
      })}
    </div>
  );
}

export default function TransactionHistory() {
  const records = useTransactionHistoryStore((state) => state.records);
  const [filters, setFilters] = useState<TransactionHistoryFilters>(defaultTransactionHistoryFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredRecords = useMemo(
    () => applyTransactionFilters(records, filters),
    [records, filters]
  );

  const selectedRecord = filteredRecords.find((record) => record.id === selectedId) ?? null;

  const toggleOperation = (value: TransactionOperation) => {
    setFilters((current) => ({
      ...current,
      operations: current.operations.includes(value)
        ? current.operations.filter((item) => item !== value)
        : [...current.operations, value],
    }));
  };

  const toggleStatus = (value: TransactionStatus) => {
    setFilters((current) => ({
      ...current,
      statuses: current.statuses.includes(value)
        ? current.statuses.filter((item) => item !== value)
        : [...current.statuses, value],
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
            <p className="text-sm text-slate-500">Normalized records across receipts, events, and placeholders.</p>
          </div>
          <span className="text-xs text-slate-500">Showing {filteredRecords.length} record(s)</span>
        </div>

        <input
          type="text"
          value={filters.query}
          onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
          placeholder="Filter by actor, target, hash, operation, or asset ticker..."
        />

        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Operation</p>
            <ToggleChips
              selected={filters.operations}
              options={TRANSACTION_OPERATIONS}
              onToggle={toggleOperation}
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Status</p>
            <ToggleChips
              selected={filters.statuses}
              options={TRANSACTION_STATUSES}
              onToggle={toggleStatus}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filteredRecords.map((record) => (
            <button
              type="button"
              key={record.id}
              onClick={() => setSelectedId(record.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selectedId === record.id
                  ? 'border-aegis-brand bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusClasses[record.status]}`}>
                    {prettyLabel(record.status)}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{prettyLabel(record.operation)}</span>
                </div>
                <span className="text-xs text-slate-500">{formatTimestamp(record.timestamp)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Actor: {truncateAddress(record.actor)} {'->'} Target: {truncateAddress(record.target)}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">Hash: {record.hash}</p>
            </button>
          ))}

          {filteredRecords.length === 0 && (
            <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-sm text-slate-500">
              No transactions match the selected filters.
            </div>
          )}
        </div>

        <aside className="border border-slate-200 rounded-lg p-4 bg-slate-50 min-h-40">
          {selectedRecord ? (
            <div className="space-y-2 text-sm text-slate-700">
              <h3 className="text-base font-semibold text-slate-900">Transaction Detail</h3>
              <p><span className="font-medium">Status:</span> {prettyLabel(selectedRecord.status)}</p>
              <p><span className="font-medium">Operation:</span> {prettyLabel(selectedRecord.operation)}</p>
              <p><span className="font-medium">Actor:</span> {selectedRecord.actor}</p>
              <p><span className="font-medium">Target:</span> {selectedRecord.target}</p>
              <p><span className="font-medium">Hash:</span> {selectedRecord.hash}</p>
              <p><span className="font-medium">Timestamp:</span> {formatTimestamp(selectedRecord.timestamp)}</p>
              <p><span className="font-medium">Source:</span> {prettyLabel(selectedRecord.source)}</p>
              {selectedRecord.assetTicker && (
                <p><span className="font-medium">Asset:</span> {selectedRecord.assetTicker}</p>
              )}
              {selectedRecord.amount !== undefined && (
                <p><span className="font-medium">Amount:</span> {selectedRecord.amount}</p>
              )}
              {selectedRecord.notes && (
                <p><span className="font-medium">Notes:</span> {selectedRecord.notes}</p>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Select a transaction to inspect full normalized details.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
