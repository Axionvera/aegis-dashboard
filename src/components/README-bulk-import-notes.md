# Bulk Import — Review UI Notes

**Scope:** Notes for whoever builds the preview/review component.  
This is NOT a component implementation. No JSX, no hooks, no logic here.  
See `docs/kyc-bulk-import-design.md` for the full workflow spec and  
`src/features/compliance/bulkImport.types.ts` for all type contracts.

---

## What the preview table must show

Each row in the preview table corresponds to one `BatchPreviewRow` from the
`BatchPreview` type. The table must display:

| Column           | Content                                                                    |
|------------------|----------------------------------------------------------------------------|
| Row #            | 1-based CSV row number (`rowNumber`). Helps uploaders locate errors in the original file. |
| Account ID       | Shortened display form (`accountIdDisplay`). Full address in `title` attribute and `aria-label`. |
| Current status   | `statusDiff.current` — use `ComplianceBadge` colour tokens. Show "—" if null (new subject). |
| → Proposed       | `statusDiff.proposed` — visually distinct from current (arrow or chevron separator). |
| Change direction | `statusDiff.changed` flag: highlight only rows where a real change occurs. No-op rows (W-002) should be de-emphasised, not hidden. |
| Action           | `actionLabel` text (e.g. "Approve", "Reject", "Flag for review", "Remove"). |
| Jurisdiction     | `jurisdictionDiff` — show "current → proposed" only when `changed: true`. |
| Tier             | `tierDiff` — same pattern as jurisdiction. |
| Warnings         | One badge per `ValidationWarning` in `warnings[]`. Show rule ID + short message. |
| Row status       | Drives row-level visual treatment (see Colour System below). |

**Aggregate summary bar** (rendered above the table, from `BatchPreviewSummary`):

```
X approve  |  Y reject  |  Z flag for review  |  N remove
W warnings  |  0 errors  |  net N rows
```

Always show all four action counts even if zero. Approvers must see the full
scope of a batch at a glance.

---

## Colour system for row status

Use the same Tailwind tokens already established in `BulkComplianceReview`:

| `rowStatus`  | Left border / row bg                | Notes                                     |
|--------------|-------------------------------------|-------------------------------------------|
| `valid`      | No special treatment                | Clean rows                                |
| `warning`    | `border-l-4 border-amber-400`       | Amber left border, `bg-amber-50` on hover |
| `error`      | `border-l-4 border-rose-500`        | Should not reach preview; defensive only  |

Status badges:
- `approved` → `bg-emerald-100 text-emerald-800`
- `rejected` → `bg-rose-100 text-rose-800`
- `review`   → `bg-sky-100 text-sky-800`
- `pending`  → `bg-amber-100 text-amber-800`

---

## Approve / reject button states

Both buttons live outside the table and act on the **entire batch**, not
individual rows.

### Approve button

| Condition                                    | State                  |
|----------------------------------------------|------------------------|
| `BatchPreview.canSubmitForReview === false`   | `disabled`             |
| Any unresolved hard error (errorCount > 0)   | `disabled`             |
| Approver identity === uploader identity      | `disabled` + tooltip: "You cannot approve your own batch" |
| Batch status is not `pending_review`         | `disabled`             |
| All above clear                              | enabled                |

### Reject button

| Condition                                    | State                  |
|----------------------------------------------|------------------------|
| Batch status is not `pending_review`         | `disabled`             |
| Approver identity === uploader identity      | `disabled` + tooltip: "You cannot reject your own batch" |
| All above clear                              | enabled (always rejectable if status is correct) |

Both buttons must require an explicit confirmation step (e.g. a modal or
inline confirmation) before firing. Irreversible actions must not be a
single click.

The "Submit for review" button (uploader side) is disabled until
`canSubmitForReview === true`.

---

## Accessibility notes for large diffs

Large batches (100–500 rows) place specific demands on keyboard and screen
reader users.

### Table

- Use a proper `<table>` with `<thead>` / `<tbody>` — not a `<div>` grid.
- Every `<th>` must have `scope="col"`.
- Each row's Account ID cell must have a `title` and `aria-label` containing
  the full address (`accountIdFull`), since the displayed value is truncated.
- The warning badge for each row should include an `aria-label` that reads
  the full warning message, not just the rule ID code.

### Summary bar

- Mark it as a `<section aria-label="Batch summary">` or equivalent landmark.
- Counts must be readable without colour — don't rely on colour alone to
  distinguish approve vs reject vs warning counts.

### Large table navigation

- Provide a "Jump to first warning" keyboard shortcut or focusable anchor
  so reviewers can skip straight to flagged rows.
- Consider adding `aria-rowcount` and `aria-rowindex` on `<tr>` elements
  when row count exceeds 50, so screen readers can announce position.
- Warn the user visually (and in an `aria-live` region) when a batch exceeds
  100 rows (rule W-007), so they are not surprised by a long review task.

### Confirmation modal (approve/reject)

- Focus must move into the modal on open.
- Pressing Escape must close the modal without confirming.
- The confirm button must not be the first focused element — require a
  deliberate Tab before the destructive action is reachable.
- After closing, focus must return to the button that opened the modal.

### Colour contrast

- All badge text must meet WCAG 2.1 AA (4.5:1 for normal text).
- The amber warning row treatment must not be the only indicator —
  add a warning icon (`⚠` with `aria-hidden="true"`) alongside the colour.

---

## What this component must NOT do

- Must not commit any compliance data changes (no API calls, no store writes).
- Must not allow inline editing of any cell value.
- Must not auto-approve or auto-apply on any user action short of explicit
  multi-step confirmation.
- Must not show the approve button to the same person who uploaded the batch.
