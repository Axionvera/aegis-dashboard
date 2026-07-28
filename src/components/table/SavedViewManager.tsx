import { useState } from 'react';
import { Bookmark, Trash2, Plus, Check } from 'lucide-react';
import type { SavedView } from '@/hooks/useTableFilters';

export interface SavedViewManagerProps {
  views: SavedView[];
  activeViewId?: string | null;
  onSave: (label: string) => void;
  onLoad: (viewId: string) => void;
  onDelete: (viewId: string) => void;
}

/**
 * Saved views dropdown. Users can save the current filter state under a
 * label, load a previously saved view, or delete one.
 */
export default function SavedViewManager({
  views,
  activeViewId,
  onSave,
  onLoad,
  onDelete,
}: SavedViewManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewLabel, setViewLabel] = useState('');

  const handleSave = () => {
    const label = viewLabel.trim();
    if (!label) return;
    onSave(label);
    setViewLabel('');
    setIsSaving(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Bookmark size={14} aria-hidden="true" />
        Saved views
        {views.length > 0 && (
          <span className="ml-0.5 text-xs text-slate-400">({views.length})</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for click-outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setIsSaving(false);
            }}
          />

          <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {/* Save new view inline form */}
            {isSaving ? (
              <div className="p-3 border-b border-slate-100">
                <input
                  type="text"
                  value={viewLabel}
                  onChange={(e) => setViewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') setIsSaving(false);
                  }}
                  placeholder="Name this view…"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-aegis-brand outline-none mb-2"
                  autoFocus
                  aria-label="Saved view name"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!viewLabel.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-1 bg-aegis-brand hover:bg-blue-600 text-white text-xs font-medium px-2 py-1.5 rounded disabled:opacity-40 transition"
                  >
                    <Check size={12} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSaving(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSaving(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 border-b border-slate-100 transition"
              >
                <Plus size={14} />
                Save current filters
              </button>
            )}

            {/* Saved views list */}
            {views.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-400 text-center">
                No saved views yet.
              </p>
            ) : (
              <ul role="listbox" className="max-h-56 overflow-y-auto">
                {views.map((view) => (
                  <li
                    key={view.id}
                    role="option"
                    aria-selected={view.id === activeViewId}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onLoad(view.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition hover:bg-slate-50 ${
                        view.id === activeViewId
                          ? 'bg-blue-50 text-aegis-brand font-medium'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{view.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(view.id);
                        }}
                        className="shrink-0 text-slate-300 hover:text-red-500 transition ml-2"
                        aria-label={`Delete view "${view.label}"`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
