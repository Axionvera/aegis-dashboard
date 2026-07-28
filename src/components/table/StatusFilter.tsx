export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface StatusFilterProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

/**
 * Multi-select chip filter. Each chip toggles the corresponding value in the
 * selected set. Shows a per-option count when provided.
 */
export default function StatusFilter({
  label,
  options,
  selected,
  onToggle,
}: StatusFilterProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition ${
                isSelected
                  ? 'bg-aegis-dark text-white border-aegis-dark'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
              }`}
              aria-pressed={isSelected}
            >
              {opt.label}
              {opt.count !== undefined && (
                <span
                  className={`ml-0.5 text-[10px] ${
                    isSelected ? 'text-white/70' : 'text-slate-400'
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
