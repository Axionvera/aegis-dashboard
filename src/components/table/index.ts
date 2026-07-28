/**
 * src/components/table/index.ts
 *
 * Reusable table filtering UI components.
 *
 * These components are designed to pair with the `useTableFilters` hook from
 * `@/hooks/useTableFilters` for a complete search / sort / filter / saved-views
 * pattern. See `docs/table-filtering.md` for usage examples.
 */

export { default as TableSearch } from './TableSearch';
export type { TableSearchProps } from './TableSearch';

export { default as TableSortHeader } from './TableSortHeader';
export type { TableSortHeaderProps } from './TableSortHeader';

export { default as StatusFilter } from './StatusFilter';
export type { StatusFilterProps, FilterOption } from './StatusFilter';

export { default as SavedViewManager } from './SavedViewManager';
export type { SavedViewManagerProps } from './SavedViewManager';
