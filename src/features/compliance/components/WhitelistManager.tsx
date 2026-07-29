import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ShieldCheck, ShieldX, Plus, AlertTriangle } from 'lucide-react';
import { useAegis } from '@/hooks/useAegis';
import { useWallet } from '@/hooks/useWallet';
import TableSearch from '@/components/table/TableSearch';
import EmptyState from '@/components/states/EmptyState';
import WhitelistActionModal, { type WhitelistAction } from './WhitelistActionModal';
import {
  searchWhitelistEntries,
  validateWhitelistAddress,
  guardWhitelistAction,
  type WhitelistEntry,
} from '@/lib/whitelist';
import { formatTimestamp, truncateAddress } from '@/utils/formatting';

type LoadState = 'loading' | 'loaded' | 'error';

interface PendingAction {
  action: WhitelistAction;
  address: string;
  note?: string;
}

/**
 * Admin compliance management dashboard — search, add, remove, and audit
 * KYC-whitelisted investor addresses.
 *
 * @see docs/admin-whitelist-management.md
 */
export default function WhitelistManager() {
  const { listWhitelist, addToWhitelist, removeFromWhitelist } = useAegis();
  const { network } = useWallet();

  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [query, setQuery] = useState('');

  const [newAddress, setNewAddress] = useState('');
  const [newNote, setNewNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await listWhitelist();
      setEntries(result);
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
    // listWhitelist is re-created every render by useAegis; only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = searchWhitelistEntries(entries, query);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const address = newAddress.trim();

    const validation = validateWhitelistAddress(address);
    if (!validation.valid) {
      setFormError(validation.reason);
      return;
    }

    const guardReason = guardWhitelistAction(entries, address, 'add');
    if (guardReason) {
      setFormError(guardReason);
      return;
    }

    setFormError(null);
    setPendingAction({ action: 'add', address, note: newNote.trim() || undefined });
  };

  const handleRemoveClick = (entry: WhitelistEntry) => {
    setPendingAction({ action: 'remove', address: entry.address, note: entry.note });
  };

  const handleReAddClick = (entry: WhitelistEntry) => {
    setPendingAction({ action: 'add', address: entry.address, note: entry.note });
  };

  const closeModal = (didSucceed: boolean) => {
    setPendingAction(null);
    if (didSucceed) {
      setNewAddress('');
      setNewNote('');
      load();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-aegis-dark">KYC Whitelist Management</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search, add, remove, and audit KYC-whitelisted investor addresses.
        </p>
      </div>

      <form
        onSubmit={handleAddSubmit}
        className="space-y-3 rounded-lg border border-slate-200 p-4"
      >
        <div>
          <label
            htmlFor="whitelist-new-address"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Address to whitelist
          </label>
          <input
            id="whitelist-new-address"
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="GABC…"
            className="w-full border border-slate-300 rounded p-2 font-mono text-sm focus:ring-2 focus:ring-aegis-brand outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="whitelist-new-note"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Note (optional)
          </label>
          <input
            id="whitelist-new-note"
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="e.g. KYC case reference"
            className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-aegis-brand outline-none"
          />
        </div>

        {formError && (
          <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={!newAddress.trim()}
          className="inline-flex items-center gap-2 bg-aegis-accent hover:bg-emerald-600 text-white px-4 py-2 rounded font-medium transition disabled:opacity-50"
        >
          <Plus size={16} aria-hidden="true" />
          Review &amp; Whitelist
        </button>
      </form>

      <TableSearch value={query} onChange={setQuery} placeholder="Search by address or note…" />

      {loadState === 'loading' && (
        <div role="status" aria-live="polite" className="py-12 text-center text-sm text-slate-500">
          Loading whitelist…
        </div>
      )}

      {loadState === 'error' && (
        <EmptyState
          variant="unavailable"
          icon={AlertTriangle}
          title="Couldn't load the whitelist"
          description="Something went wrong fetching whitelist data from the provider. Your connection or the SDK may be temporarily unavailable."
          actions={[{ label: 'Retry', onClick: load, variant: 'primary' }]}
        />
      )}

      {loadState === 'loaded' && filtered.length === 0 && (
        <EmptyState
          variant="no-data"
          icon={ShieldCheck}
          title={entries.length === 0 ? 'No whitelisted addresses yet' : 'No matches'}
          description={
            entries.length === 0
              ? 'Add an investor address above to get started.'
              : 'Try a different search term.'
          }
        />
      )}

      {loadState === 'loaded' && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-4 font-medium">Address</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Updated</th>
                <th className="py-2 pr-4 font-medium">Note</th>
                <th className="py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.address} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-mono" title={entry.address}>
                    {truncateAddress(entry.address)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        entry.status === 'whitelisted'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {entry.status === 'whitelisted' ? (
                        <ShieldCheck size={12} aria-hidden="true" />
                      ) : (
                        <ShieldX size={12} aria-hidden="true" />
                      )}
                      {entry.status === 'whitelisted' ? 'Whitelisted' : 'Revoked'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-500">{formatTimestamp(entry.updatedAt)}</td>
                  <td className="py-3 pr-4 text-slate-500">{entry.note ?? '\u2014'}</td>
                  <td className="py-3 text-right">
                    {entry.status === 'whitelisted' ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(entry)}
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReAddClick(entry)}
                        className="font-medium text-aegis-brand hover:text-blue-600"
                      >
                        Re-add
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingAction && (
        <WhitelistActionModal
          action={pendingAction.action}
          address={pendingAction.address}
          note={pendingAction.note}
          network={network ?? undefined}
          onSubmit={(onPhase) =>
            pendingAction.action === 'add'
              ? addToWhitelist(pendingAction.address, onPhase)
              : removeFromWhitelist(pendingAction.address, onPhase)
          }
          onClose={closeModal}
        />
      )}
    </div>
  );
}
