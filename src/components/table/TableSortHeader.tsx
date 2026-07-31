import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import type { SortState } from '@/hooks/useTableFilters';

export interface TableSortHeaderProps {
  label: string;
  field: string;
  currentSort: SortState;
  onSort: (field: string) => void;
}

/**
 * Clickable table column header that cycles sort direction:
 * null -> asc -> desc -> null.
 */
export default function TableSortHeader({
  label,
  field,
  currentSort,
  onSort,
}: TableSortHeaderProps) {
  const isActive = currentSort.field === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 font-medium text-xs uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors"
      aria-label={`Sort by ${label}${isActive ? ` (${currentSort.direction === 'asc' ? 'ascending' : 'descending'})` : ''}`}
    >
      {label}
      {isActive && currentSort.direction === 'asc' && (
        <ArrowUp size={14} className="text-aegis-brand" aria-hidden="true" />
      )}
      {isActive && currentSort.direction === 'desc' && (
        <ArrowDown size={14} className="text-aegis-brand" aria-hidden="true" />
      )}
      {!isActive && (
        <ChevronsUpDown size={14} className="text-slate-300" aria-hidden="true" />
      )}
    </button>
  );
}
