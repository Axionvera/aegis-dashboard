# Compliance-Safe Wording Guidance

Issue: [#37](https://github.com/Axionvera/aegis-dashboard/issues/37)

> **Important:** This document describes how to write compliance-facing copy in the Aegis Dashboard. It is **not legal, regulatory, or financial advice**. The guidance herein ensures protocol-level compliance copy never implies legal or financial authority.

## Purpose

Every user-facing string in the dashboard that describes a compliance result (status, check outcome, bulk action result, or eligibility verdict) must carry a disclaimer making clear that the information is **protocol-level only** — it is not a legal determination, regulatory guarantee, or financial recommendation.

Before this guidance was formalised, the disclaimer text was duplicated inline across several components. This document defines a single source of truth and a typed helper to keep future surfaces consistent.

## Data Model

The canonical wording lives in `src/lib/complianceReview.ts` and is exported as a plain constant so it can be reused anywhere without importing a React component:

| Export | Type | Purpose |
|---|---|---|
| `COMPLIANCE_DISCLAIMER` | `string` | The exact disclaimer sentence. Use when you only need the disclaimer itself (e.g. as a paragraph, tooltip, or aria-label). |
| `withDisclaimer(text, separator?)` | `(text: string, separator?: string) => string` | Wraps `text` with the disclaimer, separated by `separator` (default `" — "`). Returns the disclaimer alone when `text` is empty. |

## Behaviour

### Using `COMPLIANCE_DISCLAIMER`

Render the disclaimer directly wherever compliance copy appears without a surrounding message:

```tsx
<p className="text-sm text-slate-500">{COMPLIANCE_DISCLAIMER}</p>
```

### Using `withDisclaimer`

When a specific compliance message needs the disclaimer attached, use `withDisclaimer`:

```ts
withDisclaimer("Subject is KYC-verified")
// → "Subject is KYC-verified — Protocol-level compliance information. Not legal, regulatory, or financial advice."
```

The default separator is `" — "` (space-emdash-space). Pass a custom separator as the second argument:

```ts
withDisclaimer("Blocked by compliance rules", " | ")
// → "Blocked by compliance rules | Protocol-level compliance information. Not legal, regulatory, or financial advice."
```

An empty text argument returns only the disclaimer — callers do not need a guard:

```ts
withDisclaimer("") // → "Protocol-level compliance information. Not legal, regulatory, or financial advice."
```

## Edge Cases & Failure States

| Case | Behaviour | Rationale |
|---|---|---|
| Empty text passed to `withDisclaimer` | Returns only the disclaimer | Avoids rendering a bare separator or empty prefix in error/loading states |
| Text that already contains the disclaimer | Passes through unchanged — the helper does not de-duplicate | The helper is a simple concatenation utility; callers should avoid double-wrapping |
| Custom separator | Used verbatim. No validation or trimming is applied. | Caller controls formatting; a space is recommended before and after the separator |
| `COMPLIANCE_DISCLAIMER` in isolation | Plain string — no HTML, no wrapping | Safe in `textContent`, `aria-label`, React children, and test assertions |

## Security & Compliance Assumptions

- **Protocol-level only.** The disclaimer must never be removed, shortened, or embedded inside copy that implies legal or financial authority. Doing so creates regulatory risk for operators relying on the dashboard.
- **No PII in the disclaimer.** The disclaimer is static text. No dynamic values (addresses, jurisdiction codes, subject names) are interpolated into it.
- **Consistent across surfaces.** Every dashboard surface that renders a compliance result must use `COMPLIANCE_DISCLAIMER` or `withDisclaimer`. If a new component, SDK boundary, or documentation page describes compliance results, it must include the disclaimer.
- **Not a substitute for legal review.** This guidance ensures consistent wording at the protocol level, but does not replace qualified legal review of jurisdiction-specific compliance copy.

## Tests, Fixtures & Review Checklist

- `src/lib/complianceReview.test.ts` — Tests covering:
  - `COMPLIANCE_DISCLAIMER` contains the mandated "not legal, regulatory, or financial advice" wording
  - `COMPLIANCE_DISCLAIMER` includes "protocol-level"
  - `withDisclaimer` prepends text before the disclaimer
  - `withDisclaimer` accepts a custom separator
  - `withDisclaimer` returns only the disclaimer for empty text
  - `withDisclaimer` composes with itself without error

**Reviewer checklist:**

- [ ] Every new compliance-facing string uses `COMPLIANCE_DISCLAIMER` or `withDisclaimer`.
- [ ] No compliance copy removes, shortens, or hides the disclaimer.
- [ ] The disclaimer is not embedded inside interactive elements where it could be overlooked (e.g. inside a truncated tooltip).
- [ ] If the PR adds a new compliance surface (component, page, documentation section), the disclaimer is present and visible.
- [ ] Protocol-level compliance is never presented as legal or financial advice.

## Compatibility

- `COMPLIANCE_DISCLAIMER` and `withDisclaimer` are pure exports from `src/lib/complianceReview.ts` — the same module that already provides `deriveStatus`, `filterSubjects`, and the rest of the compliance core.
- Because the module is framework-agnostic (no React), the same constant can back an SDK helper, a documentation snippet, or an API response without duplication.
- Import via the repo's `@/lib/complianceReview` alias, consistent with existing usage across the project.

## Related

- [Bulk Compliance Review](bulk-compliance-review.md) — Technical implementation of the compliance review table
- [Compliance Reviewer Workflow](compliance-reviewer-workflow.md) — Operator-facing workflow documentation
- [SDK Error Recovery](sdk-error-recovery.md) — Recovery plans that also include compliance-safe wording
- [Transaction Components](transaction-components.md) — Notes on conservative compliance copy in transaction flows
- [Design Guidelines](design-guidelines.md) — General UI conventions
