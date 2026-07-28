# Table Filtering & Saved Views

## Overview

A reusable pattern for table filtering, sorting, search, and saved views across the dashboard. Built from two layers:

1. **`useTableFilters` hook** — manages filter state, sorting, and saved views with localStorage persistence
2. **Table UI components** — `TableSearch`, `TableSortHeader`, `StatusFilter`, `SavedViewManager`

## Architecture

```
src/
  hooks/
    useTableFilters.ts       — Core hook + pure filter/sort utilities
  components/
    table/
      TableSearch.tsx         — Search input with clear button
      TableSortHeader.tsx     — Clickable sort column header
      StatusFilter.tsx        — Multi-select chip filter
      SavedViewManager.tsx    — Save/load/delete filter presets
      index.ts               — Barrel export
```

### Separations

- **Pure logic** (`applyQuery`, `applySort`, `applyFilters`, `applyAllFilters`, `cycleSort`) is framework-agnostic and exported standalone for testing or non-React reuse.
- **React hook** (`useTableFilters`) wraps the pure logic with state management, localStorage persistence for saved views, and convenience accessors.
- **UI components** are thin presentational wrappers that accept value/callback props — no internal state management.

## Usage

### Basic: Adding filters to any table

```tsx
import { useMemo } from 'react';
import { useTableFilters } from '@/hooks/useTableFilters';
import { TableSearch, TableSortHeader, StatusFilter, SavedViewManager } from '@/components/table';

function MyTable({ records }) {
  const tf = useTableFilters({ namespace: 'my-table' });

  const visible = useMemo(
    () => tf.applyTo(records, ['name', 'email', 'id']),
    [records, tf.state],
  );

  return (
    <div>
      {/* Search */}
      <TableSearch
        value={tf.state.query}
        onChange={tf.setQuery}
        placeholder="Search records…"
      />

      {/* Status filter */}
      <StatusFilter
        label="Status"
        options={[
          { value: 'active', label: 'Active', count: 5 },
          { value: 'inactive', label: 'Inactive', count: 2 },
        ]}
        selected={tf.state.filters['status'] ?? []}
        onToggle={(v) => tf.toggleFilter('status', v)}
      />

      {/* Sortable table headers */}
      <table>
        <thead>
          <tr>
            <th>
              <TableSortHeader
                label="Name"
                field="name"
                currentSort={tf.state.sort}
                onSort={tf.setSort}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.id}>{/* ... */}</tr>
          ))}
        </tbody>
      </table>

      {/* Saved views */}
      <SavedViewManager
        views={tf.savedViews}
        onSave={tf.saveView}
        onLoad={tf.loadView}
        onDelete={tf.deleteView}
      />

      {/* Reset */}
      <button onClick={tf.resetFilters}>Reset filters</button>
    </div>
  );
}
```

### Selecting the namespace

The `namespace` parameter in `useTableFilters({ namespace })` is used as the localStorage key prefix. Choose a unique, stable name per table instance (e.g. `"bulk-compliance-review"`, `"issuance-requests"`). Saved views are serialised under `aegis-table-views:<namespace>`.

## API Reference

### `useTableFilters({ namespace, initial? })`

Returns:

| Return value | Type | Description |
|---|---|---|
| `state` | `TableFilterState` | Current filter state `{ query, filters, sort }` |
| `savedViews` | `SavedView[]` | Array of saved views from localStorage |
| `setQuery(q)` | `(q: string) => void` | Update search query |
| `setFilter(key, values)` | `(key: string, values: string[]) => void` | Replace all values for a filter key |
| `toggleFilter(key, value)` | `(key: string, value: string) => void` | Toggle a single filter value |
| `setSort(field)` | `(field: string) => void` | Cycle sort: none → asc → desc → none |
| `saveView(label)` | `(label: string) => void` | Save current filter state as a named view |
| `loadView(id)` | `(id: string) => void` | Restore filters from a saved view |
| `deleteView(id)` | `(id: string) => void` | Delete a saved view |
| `resetFilters()` | `() => void` | Reset to default filter state |

### `applyTo(records, searchFields)`

Convenience method that applies query + filters + sort in one call. Use inside `useMemo`:

```tsx
const visible = useMemo(
  () => tf.applyTo(records, ['name', 'email']),
  [records, tf.state],
);
```

### Pure functions

These are exported from `@/hooks/useTableFilters` for direct use:

- `applyQuery(records, query, searchFields)` — text search
- `applySort(records, sort)` — sort by field+direction
- `applyFilters(records, filters)` — multi-select filter
- `applyAllFilters(records, state, searchFields)` — all three combined
- `cycleSort(current, field)` — compute next sort state

## Component Props

### `TableSearch`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Current search query |
| `onChange` | `(value: string) => void` | — | Called when query changes |
| `placeholder` | `string` | `"Search…"` | Input placeholder |

### `TableSortHeader`

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Column display label |
| `field` | `string` | Field key for sorting |
| `currentSort` | `SortState` | Current sort state from hook |
| `onSort` | `(field: string) => void` | Called on click (wire to `setSort`) |

### `StatusFilter`

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Filter group label |
| `options` | `FilterOption[]` | Options with `{ value, label, count? }` |
| `selected` | `string[]` | Currently selected values |
| `onToggle` | `(value: string) => void` | Called on chip click |

### `SavedViewManager`

| Prop | Type | Description |
|---|---|---|
| `views` | `SavedView[]` | Array of saved views from hook |
| `activeViewId` | `string \| null` | Currently active view id |
| `onSave` | `(label: string) => void` | Save current filters |
| `onLoad` | `(viewId: string) => void` | Load a saved view |
| `onDelete` | `(viewId: string) => void` | Delete a saved view |

## Integration Examples

This pattern is currently integrated into:

1. **Bulk Compliance Review** (`src/features/admin/components/BulkComplianceReview.tsx`)
   - Search by address/jurisdiction
   - Status and severity filter chips
   - Sortable subject, severity, status columns
   - Saved views

2. **Issuance Requests Table** (`src/features/issuer/components/IssuanceRequestsTable.tsx`)
   - Search by asset name, ticker, jurisdiction, request ID
   - Status filter chips
   - All columns sortable
   - Saved views

## Accessibility

- All filter controls have descriptive `aria-label`/`aria-pressed` attributes
- Sort headers announce current sort direction
- Saved views use `role="listbox"` / `role="option"` with `aria-selected`
- Keyboard navigation: Enter to save, Escape to cancel in the save-view form
- Search input has a clear button with `aria-label="Clear search"`

## Best Practices

1. **Use unique namespaces** — each table instance needs its own localStorage namespace to avoid view collisions
2. **Memoise filtered results** — wrap `applyTo` in `useMemo` with `[records, tf.state]` dependencies
3. **Combine with existing patterns** — `StatusFilter` pairs naturally with `tallyByStatus` or other summary data
4. **Provide reset** — always show a reset action when filters are active
5. **Show record count** — display filtered vs total count when filters are active
6. **Handle empty states** — use `EmptyState` from `@/components/states` when results are empty
