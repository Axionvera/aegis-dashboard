# Audit Log Filtering & Safe Export

Issue: [#35](https://github.com/Axionvera/aegis-dashboard/issues/35)

> **Important:** This document describes protocol-level audit log mechanics in the Aegis Dashboard. It is **not legal, regulatory, or financial advice**. Audit trail entries reflect on-chain and dashboard-admin actions only — they do not constitute a legal record or compliance certification.

## Purpose

The audit log module provides a reusable, typed workflow for recording and reviewing administrative actions in the Aegis Dashboard. It covers filtering by actor, action type, date range, and free-text query, plus safe export to CSV and JSON with redaction support.

All logic lives in framework-agnostic pure functions so it can be unit-tested without a DOM and reused by both the dashboard UI and any future admin API integration.

## Data Model

The canonical types are defined in `src/lib/audit.ts`:

| Export | Type | Purpose |
|---|---|---|
| `AuditLogAction` | union | Allowed action types: `role_change`, `compliance_update`, `settings_change`, `bulk_import`, `system`, `export` |
| `AuditLogEntry` | interface | Single audit record with `id`, `actor`, `action`, `target`, `timestamp`, optional `details`, `source`, `metadata` |
| `AuditLogFilters` | interface | `{ query, actions, dateFrom?, dateTo? }` |
| `AUDIT_LOG_ACTIONS` | `AuditLogAction[]` | Array of all action values for populating filter chips |
| `defaultAuditLogFilters` | `AuditLogFilters` | Default filter state (empty query, no action filter) |

### `AuditLogEntry` fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier |
| `actor` | `string` | Yes | Wallet address or system identifier who performed the action |
| `action` | `AuditLogAction` | Yes | Category of action performed |
| `target` | `string` | Yes | The resource or subject the action affected |
| `timestamp` | `string` | Yes | ISO 8601 timestamp of when the action occurred |
| `details` | `string` | No | Human-readable description |
| `source` | `string` | No | System component that generated the entry |
| `metadata` | `Record<string, unknown>` | No | Extensible machine-readable payload |

## Filtering

### `applyAuditLogFilters(entries, filters)`

Pure function that filters an array of `AuditLogEntry` records by the provided `AuditLogFilters`. All filter dimensions use AND semantics:

- **`query`** — case-insensitive free-text search across `actor`, `action`, `target`, and `details`
- **`actions`** — multi-select filter; empty array means "all actions"
- **`dateFrom`** — ISO 8601 string; entries must have `timestamp >= dateFrom`
- **`dateTo`** — ISO 8601 string; entries must have `timestamp <= dateTo`

```ts
import { applyAuditLogFilters, defaultAuditLogFilters } from '@/lib/audit';

const filtered = applyAuditLogFilters(entries, {
  ...defaultAuditLogFilters,
  actions: ['role_change', 'settings_change'],
  dateFrom: '2026-07-01T00:00:00.000Z',
});
```

### Integration with `useTableFilters`

The `AuditLogFilters` interface is compatible with the reusable `useTableFilters` hook from `@/hooks/useTableFilters`. Map `filters.actions` to `state.filters['actions']` and use `toggleFilter('actions', value)` for multi-select chip behaviour. The `query` field maps directly to `state.query`. See [docs/table-filtering.md](table-filtering.md) for the full pattern.

## Safe Export

### `exportAuditLogToCsv(entries, options?)`

Serialises an array of `AuditLogEntry` records to CSV (RFC 4180).

| Option | Type | Default | Description |
|---|---|---|---|
| `includeDisclaimer` | `boolean` | `true` | Prepend `# Protocol-level compliance information...` comment row |
| `includeMetadata` | `boolean` | `false` | Include the `metadata` JSON column |

Safety guarantees:
- **BOM prefix** (`\uFEFF`) — correct Excel UTF-8 detection
- **RFC 4180 escaping** — commas, double-quotes, and newlines inside values are properly escaped
- **CSV injection prevention** — values starting with `=`, `+`, `-`, `@`, or `\t` are prefixed with a tab character
- **Null/undefined fields** — rendered as empty strings

```ts
import { exportAuditLogToCsv } from '@/lib/audit';

const csv = exportAuditLogToCsv(entries);
// Use with a Blob download:
// const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
// const url = URL.createObjectURL(blob);
```

### `exportAuditLogToJson(entries, options?)`

Serialises an array of `AuditLogEntry` records to pretty-printed JSON.

| Option | Type | Default | Description |
|---|---|---|---|
| `includeDisclaimer` | `boolean` | `true` | Wrap in `{ disclaimer, entries }` object |
| `includeMetadata` | `boolean` | `false` | Include the `metadata` field per entry |

```ts
import { exportAuditLogToJson } from '@/lib/audit';

const json = exportAuditLogToJson(entries);
```

### `redactAuditEntry(entry, options?)`

Returns a new entry with sensitive fields masked or truncated. Does not mutate the original.

| Option | Type | Default | Description |
|---|---|---|---|
| `actor` | `boolean` | `false` | Truncate actor to `GABC...WXYZ` format |
| `target` | `boolean` | `false` | Truncate target to `GABC...WXYZ` format |
| `details` | `boolean` | `false` | Replace details with `[redacted]` |
| `maxFieldLength` | `number` | `Infinity` | Truncate any string field longer than this value |

```ts
import { redactAuditEntry } from '@/lib/audit';

const safeEntry = redactAuditEntry(entry, {
  actor: true,
  target: true,
  maxFieldLength: 100,
});
```

## Edge Cases & Failure States

### Filtering

| Case | Behaviour | Rationale |
|---|---|---|
| Empty entries array | Returns `[]` | No records to filter — caller sees empty state |
| No filters set (defaults) | Returns all entries | Unfiltered view shows complete audit log |
| Whitespace-only query | Treated as empty — returns all matches for other filters | Consistent with existing `useTableFilters` behaviour |
| Query with no matches | Returns `[]` | Caller should render a no-results empty state |
| `dateFrom` after `dateTo` | Returns `[]` (no timestamps can satisfy both) | Correct per AND semantics |
| `dateFrom` or `dateTo` at midnight | Boundary-inclusive — exact match passes | ISO 8601 string comparison is consistent with lexicographic ordering |
| Combined action + query + date | Intersection of all dimensions | Every filter narrows the result set |

### CSV Export

| Case | Behaviour | Rationale |
|---|---|---|
| Empty entries | Returns header row + disclaimer (if enabled), no data rows | File is still valid — header defines columns |
| Value contains comma | Wrapped in double quotes per RFC 4180 | Preserves column alignment in spreadsheet apps |
| Value contains double quote | Escaped as `""` per RFC 4180 | RFC 4180 compliance |
| Value starts with `=` / `+` / `-` / `@` | Prepended with tab character | Prevents CSV injection (formula execution) |
| `includeDisclaimer: false` | No comment row, no disclaimer wrapper | Caller may attach disclaimer separately |
| Null or undefined optional field | Rendered as empty string | Prevents "null" text in spreadsheet cells |

### JSON Export

| Case | Behaviour | Rationale |
|---|---|---|
| Empty entries | `{ disclaimer, entries: [] }` or `[]` | Valid JSON either way |
| `includeDisclaimer: true` | Wrapped in object with `disclaimer` + `entries` keys | Consumer can extract both fields |
| `includeDisclaimer: false` | Bare array — no wrapper | Simpler parsing for programmatic consumers |
| `includeMetadata: false` | `metadata` key omitted from each entry | Keeps export payload lean by default |

### Redaction

| Case | Behaviour | Rationale |
|---|---|---|
| `actor: true` on short address (< 12 chars) | Returned as-is | Truncation pattern requires minimum length |
| `details: true` with undefined `details` | Returns `'[redacted]'` | Consistent with all-details-redacted intent — caller should not pass `details: true` if they know the field is empty |
| `maxFieldLength: 20` on 100-char value | Truncated to 17 chars + `...` | Boundary visible to reader |
| No options set | Entry returned unchanged | Redaction is opt-in — caller controls what to expose |

## Security & Compliance Assumptions

- **Protocol-level only.** Audit log entries reflect dashboard and on-chain admin actions. They are not a substitute for a formal compliance or legal audit trail.
- **No PII in metadata.** The `metadata` field must not contain personally identifiable information. Use references (account IDs, batch IDs) instead of raw personal data.
- **CSV injection prevention is a security control.** The tab-prefix technique prevents formula execution in spreadsheet applications. Do not remove it.
- **Disclaimer is mandatory for compliance surfaces.** Exported audit data that may be used in compliance review must include the disclaimer. The `includeDisclaimer: false` flag is intended for internal/programmatic use only.
- **Redaction is caller responsibility.** `redactAuditEntry` provides the mechanism but does not auto-detect sensitive content. Callers must decide which fields to redact based on their access policy.
- **Not a substitute for legal review.** This module provides protocol-level audit mechanics. It does not replace qualified legal review of audit trail requirements in regulated jurisdictions.

## Tests, Fixtures & Review Checklist

- `src/lib/audit.test.ts` — Tests covering:
  - `applyAuditLogFilters` — action, query, and date range filtering; combined filters; empty results; whitespace query; empty input
  - `exportAuditLogToCsv` — header/data rows, disclaimer, BOM, RFC 4180 escaping, CSV injection prevention, optional fields, empty entries
  - `exportAuditLogToJson` — disclaimer wrapper, metadata exclusion/inclusion, empty entries
  - `redactAuditEntry` — address redaction, detail masking, field truncation, unchanged defaults, combined options

- `src/lib/__fixtures__/auditLog.ts` — `sampleAuditLogEntries` covering every action type, system actors, metadata payloads, and multiple date ranges

### Reviewer checklist

- [ ] Every new audit-facing string uses `COMPLIANCE_DISCLAIMER` or is consistent with the protocol-level wording.
- [ ] CSV export includes BOM and injection prevention for all user-influenced columns.
- [ ] Redaction is opt-in — no fields are masked unless the caller explicitly requests it.
- [ ] Exported data does not contain PII in metadata or details fields.
- [ ] Audit log filtering is consistent with the existing `useTableFilters` pattern where applicable.
- [ ] Future audit log UI (`/admin/audit`) should reuse `applyAuditLogFilters` and `useTableFilters` rather than reimplementing filter logic.

## Compatibility

- All exports are pure functions from `src/lib/audit.ts` — no React, no DOM, no side effects.
- `COMPLIANCE_DISCLAIMER` is imported from `@/lib/complianceReview` — the single source of truth for compliance-safe wording.
- `AuditLogFilters` is designed to be compatible with `useTableFilters` from `@/hooks/useTableFilters` — `actions` maps to `state.filters['actions']`, `query` maps to `state.query`.
- The `redactAuditEntry` address truncation pattern matches `src/utils/formatting.ts` `truncateAddress`.
- The CSV export pattern is new to the codebase — no existing module provided tabular export before this.

## Related

- [Table Filtering & Saved Views](table-filtering.md) — Reusable filtering hook and UI components
- [Admin Role Management Design](admin-role-management-design.md) — Audit log UI design for `/admin/audit`
- [Compliance-Safe Wording Guidance](compliance-safe-wording.md) — Canonical disclaimer text
- [Transaction History](transaction-history.md) — Normalised transaction model for on-chain activity
- [Bulk Compliance Review](bulk-compliance-review.md) — KYC bulk import with per-batch audit trail
