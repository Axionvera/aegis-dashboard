/**
 * useTableFilters — reusable table filtering, sorting, search, and saved views.
 *
 * Framework-agnostic pure logic lives here so it can be unit-tested without a
 * DOM. Wraps state in a React hook for convenience; the core types and
 * functions are exported standalone for reuse in non-React contexts.
 *
 * Design:
 *  - One hook per table instance (caller chooses search fields, sort field,
 *    and filter map).
 *  - Saved views are serialised to localStorage under a namespace key.
 *  - All filter state is a plain object — easy to snapshot, test, or persist.
 */

import { useCallback, useMemo, useState } from 'react';

/* ── Types ─────────────────────────────────────────── */

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: string;
  direction: SortDirection;
}

export interface SavedView {
  id: string;
  label: string;
  query: string;
  filters: Record<string, string[]>;
  sort: SortState;
}

export interface TableFilterState {
  /** Free-text search query. */
  query: string;
  /** Multi-select filters keyed by field name (e.g. { status: ['approved', 'pending'] }). */
  filters: Record<string, string[]>;
  /** Current sort instruction. */
  sort: SortState;
}

export const DEFAULT_SORT: SortState = { field: '', direction: null };

export const DEFAULT_TABLE_FILTER_STATE: TableFilterState = {
  query: '',
  filters: {},
  sort: DEFAULT_SORT,
};

/* ── Pure helpers (framework-agnostic) ─────────────── */

/**
 * Apply a text query to a list of records, matching against the specified
 * searchable fields. Case-insensitive.
 */
export function applyQuery<T extends Record<string, any>>(
  records: T[],
  query: string,
  searchFields: (keyof T)[],
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return records;
  return records.filter((r) =>
    searchFields.some((field) => {
      const val = r[field];
      return val != null && String(val).toLowerCase().includes(q);
    }),
  );
}

/**
 * Sort records by a field, with cycle: null -> asc -> desc -> null.
 * Supports string and number fields. Falls back to identity comparison for
 * other types.
 */
export function applySort<T extends Record<string, any>>(
  records: T[],
  sort: SortState,
): T[] {
  if (!sort.direction) return records;
  const { field, direction } = sort;
  return [...records].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let cmp: number;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }
    return direction === 'desc' ? -cmp : cmp;
  });
}

/**
 * Apply multi-select filters. A record passes if for every filter key, the
 * record's value is in the selected set. When a filter key has an empty
 * array, it is ignored (no filtering on that dimension).
 */
export function applyFilters<T extends Record<string, any>>(
  records: T[],
  filters: Record<string, string[]>,
): T[] {
  const keys = Object.keys(filters);
  if (keys.length === 0) return records;

  return records.filter((r) =>
    keys.every((key) => {
      const selected = filters[key];
      if (!selected || selected.length === 0) return true;
      const val = r[key];
      return val != null && selected.includes(String(val));
    }),
  );
}

/**
 * Run query + filters + sort in one pass.
 */
export function applyAllFilters<T extends Record<string, any>>(
  records: T[],
  state: TableFilterState,
  searchFields: (keyof T)[],
): T[] {
  let result = applyQuery(records, state.query, searchFields);
  result = applyFilters(result, state.filters);
  result = applySort(result, state.sort);
  return result;
}

/**
 * Cycle sort direction for a column: null -> asc -> desc -> null.
 */
export function cycleSort(current: SortState, field: string): SortState {
  if (current.field !== field) {
    return { field, direction: 'asc' };
  }
  switch (current.direction) {
    case 'asc':
      return { field, direction: 'desc' };
    case 'desc':
      return { field: '', direction: null };
    default:
      return { field, direction: 'asc' };
  }
}

/* ── Saved views (localStorage) ────────────────────── */

const VIEWS_STORAGE_KEY_PREFIX = 'aegis-table-views:';

function storageKey(namespace: string): string {
  return `${VIEWS_STORAGE_KEY_PREFIX}${namespace}`;
}

export function loadSavedViews(namespace: string): SavedView[] {
  try {
    const raw = localStorage.getItem(storageKey(namespace));
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

export function saveViewsToStorage(namespace: string, views: SavedView[]): void {
  try {
    localStorage.setItem(storageKey(namespace), JSON.stringify(views));
  } catch {
    // localStorage may be full or unavailable — silently ignore.
  }
}

/* ── React hook ────────────────────────────────────── */

export interface UseTableFiltersOptions {
  /** localStorage namespace for saved views (unique per table instance). */
  namespace: string;
  /** Initial filter state (defaults to empty / unsorted). */
  initial?: Partial<TableFilterState>;
}

export function useTableFilters(options: UseTableFiltersOptions) {
  const { namespace } = options;

  const [state, setState] = useState<TableFilterState>(() => ({
    ...DEFAULT_TABLE_FILTER_STATE,
    ...options.initial,
  }));

  /* Saved views */
  const [savedViews, setSavedViews] = useState<SavedView[]>(() =>
    loadSavedViews(namespace),
  );

  const persistViews = useCallback(
    (views: SavedView[]) => {
      setSavedViews(views);
      saveViewsToStorage(namespace, views);
    },
    [namespace],
  );

  const saveView = useCallback(
    (label: string) => {
      const view: SavedView = {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        label,
        query: state.query,
        filters: { ...state.filters },
        sort: { ...state.sort },
      };
      persistViews([...savedViews, view]);
    },
    [state, savedViews, persistViews],
  );

  const loadView = useCallback(
    (viewId: string) => {
      const view = savedViews.find((v) => v.id === viewId);
      if (!view) return;
      setState({
        query: view.query,
        filters: { ...view.filters },
        sort: { ...view.sort },
      });
    },
    [savedViews],
  );

  const deleteView = useCallback(
    (viewId: string) => {
      persistViews(savedViews.filter((v) => v.id !== viewId));
    },
    [savedViews, persistViews],
  );

  /* Mutators */
  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const setFilter = useCallback(
    (key: string, values: string[]) => {
      setState((prev) => ({
        ...prev,
        filters: { ...prev.filters, [key]: values },
      }));
    },
    [],
  );

  const toggleFilter = useCallback((key: string, value: string) => {
    setState((prev) => {
      const current = prev.filters[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        filters: { ...prev.filters, [key]: next },
      };
    });
  }, []);

  const setSort = useCallback((field: string) => {
    setState((prev) => ({
      ...prev,
      sort: cycleSort(prev.sort, field),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(DEFAULT_TABLE_FILTER_STATE);
  }, []);

  const result = useMemo(
    () => ({
      state,
      savedViews,
      setQuery,
      setFilter,
      toggleFilter,
      setSort,
      saveView,
      loadView,
      deleteView,
      resetFilters,
      /**
       * Convenience: apply all filters to a record array in one call. Use
       * inside a `useMemo` at the call site.
       */
      applyTo: <T extends Record<string, any>>(
        records: T[],
        searchFields: (keyof T)[],
      ) => applyAllFilters(records, state, searchFields),
    }),
    [
      state,
      savedViews,
      setQuery,
      setFilter,
      toggleFilter,
      setSort,
      saveView,
      loadView,
      deleteView,
      resetFilters,
    ],
  );

  return result;
}
