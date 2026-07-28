# KYC Bulk Import — Design Document

**Status:** Draft  
**Author:** TBD  
**Last updated:** 2026-07-28

---

## Table of Contents

1. [Purpose and Scope](#1-purpose-and-scope)
2. [Workflow Overview](#2-workflow-overview)
3. [CSV / Template Format Spec](#3-csv--template-format-spec)
4. [Validation Rules](#4-validation-rules)
5. [Preview Rules](#5-preview-rules)
6. [Review-Before-Signing Assumptions](#6-review-before-signing-assumptions)
7. [Error Handling](#7-error-handling)
8. [Security Risks](#8-security-risks)
9. [Open Questions](#9-open-questions)

---

## 1. Purpose and Scope

This document defines the **design contract** for the KYC whitelist bulk import feature. It covers the full intended workflow from file upload through to audit-logged state changes.

### What this document IS

- A specification and design contract
- The canonical reference for TypeScript interfaces (`bulkImport.types.ts`)
- The source of truth for validation rules, preview behaviour, and the mandatory human review gate

### What this document IS NOT

- An implementation guide (no upload UI, parser, or signing endpoint is defined here)
- A regulatory or legal compliance opinion

### Why this feature is needed

The existing `BulkComplianceReview` component operates on pre-loaded, in-memory subjects and applies changes immediately upon a user action. There is no defined workflow for importing a batch of new KYC status changes from an external source (e.g. a KYC provider), no validation of the incoming data, and critically no enforced maker-checker review before state is committed. This design addresses all three gaps.

---

## 2. Workflow Overview

### Step-by-step sequence

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  UPLOADER   │     │     SYSTEM       │     │  APPROVER (different │
│  (issuer /  │     │  (frontend +     │     │  person from         │
│   admin)    │     │   backend)       │     │  uploader)           │
└──────┬──────┘     └────────┬─────────┘     └──────────┬───────────┘
       │                     │                           │
       │  1. Upload CSV      │                           │
       │────────────────────>│                           │
       │                     │                           │
       │  2. Schema check    │                           │
       │     (columns,       │                           │
       │     encoding,       │                           │
       │     row count)      │                           │
       │<────────────────────│                           │
       │                     │                           │
       │  3. Data validation │                           │
       │     (IDs, dupes,    │                           │
       │     transitions)    │                           │
       │<────────────────────│                           │
       │                     │                           │
       │  4. Preview diff    │                           │
       │     (current →      │                           │
       │     proposed per    │                           │
       │     row; read-only) │                           │
       │<────────────────────│                           │
       │                     │                           │
       │  5. Uploader        │                           │
       │     submits for     │                           │
       │     review          │                           │
       │────────────────────>│                           │
       │                     │  6. Notify approver       │
       │                     │─────────────────────────> │
       │                     │                           │
       │                     │  ╔═══════════════════╗    │
       │                     │  ║  HUMAN REVIEW     ║    │
       │                     │  ║  GATE (no state   ║    │
       │                     │  ║  change has       ║    │
       │                     │  ║  occurred yet)    ║    │
       │                     │  ╚═══════════════════╝    │
       │                     │                           │
       │                     │  7. Approver reviews      │
       │                     │     preview diff,         │
       │                     │     approves or rejects   │
       │                     │<─────────────────────────│
       │                     │                           │
       │  8. Approval logged │                           │
       │     (identity +     │                           │
       │     timestamp +     │                           │
       │     signature)      │                           │
       │<────────────────────│                           │
       │                     │                           │
       │  9. Apply batch:    │                           │
       │     write each row  │                           │
       │     to store /      │                           │
       │     contract        │                           │
       │<────────────────────│                           │
       │                     │                           │
       │  10. Audit log:     │                           │
       │      per-row        │                           │
       │      before/after,  │                           │
       │      immutable      │                           │
       │<────────────────────│                           │
```

### Key constraint: the human review gate

**No batch may transition from `pending_review` to `approved` / `applied` without an explicit approval action performed by a human who is different from the person who uploaded the file.** This is the maker-checker principle and is non-negotiable. Steps 1–5 are preparatory and non-committing. The first state change happens in step 9, and only after step 7 has been completed.

---

## 3. CSV / Template Format Spec

### 3.1 Encoding and delimiter

| Property        | Required value             |
|-----------------|----------------------------|
| Encoding        | UTF-8 (no BOM)             |
| Delimiter       | Comma (`,`)                |
| Line ending     | LF (`\n`) or CRLF (`\r\n`) |
| Quote character | Double-quote (`"`)         |
| First row       | Header row (column names)  |

### 3.2 Column specification

Columns **must appear in this exact order**. Extra columns to the right are **ignored** (forward-compatibility rule — see §3.5).

| # | Column name         | Type    | Required | Allowed values                                      | Notes                                    |
|---|---------------------|---------|----------|-----------------------------------------------------|------------------------------------------|
| 1 | `schema_version`    | string  | Yes      | `1.0`                                               | Must match current template version     |
| 2 | `account_id`        | string  | Yes      | Stellar address (G…, 56 chars) or stable entity ID  | Primary key; identifies the subject      |
| 3 | `action`            | string  | Yes      | `approve`, `reject`, `flag_review`, `remove`        | What to do to this subject               |
| 4 | `proposed_status`   | string  | Yes      | `approved`, `rejected`, `review`, `pending`         | Target status after the action is applied|
| 5 | `jurisdiction`      | string  | No       | ISO 3166-1 alpha-2 code (e.g. `US`, `EU`, `SG`)     | Blank = unchanged                        |
| 6 | `tier`              | string  | No       | `retail`, `accredited`, `professional`, `unknown`   | Blank = unchanged                        |
| 7 | `reason_code`       | string  | No       | Free text, max 120 chars                            | Human-readable reason; ends up in audit  |
| 8 | `effective_date`    | string  | No       | ISO 8601 date (`YYYY-MM-DD`)                        | When the status should take effect       |
| 9 | `external_ref`      | string  | No       | Free text, max 80 chars                             | KYC provider reference / case ID        |

### 3.3 Required vs optional summary

- **Required:** `schema_version`, `account_id`, `action`, `proposed_status`
- **Optional:** `jurisdiction`, `tier`, `reason_code`, `effective_date`, `external_ref`

Optional columns that are blank or absent will leave the corresponding field unchanged on the subject record.

### 3.4 Constraints

| Constraint              | Value        | Justification                                                        |
|-------------------------|--------------|----------------------------------------------------------------------|
| Max rows per upload     | 500          | Limits blast radius of a compromised or mistaken upload              |
| Max file size           | 2 MB         | Prevents DoS via large file parsing                                  |
| Max batches per hour    | 5 per user   | Rate-limits automated/scripted abuse                                 |

### 3.5 Versioning

The `schema_version` column is the versioning mechanism.

- **Current version:** `1.0`
- **Adding a new optional column** in a future version: increment to `1.1`. Old `1.0` templates remain valid because extra columns are appended to the right and missing optional columns are treated as blank.
- **Removing or reordering a column, or changing a required column's allowed values**: increment major version to `2.0`. The parser must reject `1.x` files with a clear message: _"This template is version 1.x. Please download and use the current 2.0 template."_
- Templates must self-describe their version. A file with no `schema_version` column is rejected with a schema error.

---

## 4. Validation Rules

Validation happens in two ordered phases. Phase 1 (schema) must pass before Phase 2 (data) runs.

### 4.1 Schema-level checks (Phase 1)

These are **hard rejects** — the entire batch is blocked. They are hard rejects because the file is structurally unusable; partial processing would be meaningless.

| Rule ID   | Description                                                              |
|-----------|--------------------------------------------------------------------------|
| `S-001`   | File encoding is UTF-8                                                   |
| `S-002`   | Delimiter is comma                                                       |
| `S-003`   | First row is a header row with all required column names present         |
| `S-004`   | `schema_version` column value matches a supported version (`1.0`)        |
| `S-005`   | File has at least 1 data row (after header)                              |
| `S-006`   | File has no more than 500 data rows                                      |
| `S-007`   | File is no larger than 2 MB                                              |
| `S-008`   | `proposed_status` values are within the allowed set                      |
| `S-009`   | `action` values are within the allowed set                               |
| `S-010`   | `effective_date`, if present, is a valid ISO 8601 date                   |

### 4.2 Data-level checks (Phase 2)

These operate row by row. Each check is either a **hard reject** (blocks the entire batch) or a **soft warning** (row is flagged but the batch can proceed).

#### Hard rejects (block entire batch)

| Rule ID   | Description                                                                                          | Why hard?                                                              |
|-----------|------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| `D-001`   | `account_id` is non-empty                                                                            | A row without an ID cannot be applied to anything                      |
| `D-002`   | No two rows in the same file share the same `account_id`                                             | Duplicate rows introduce ambiguity about final state                   |
| `D-003`   | `action` and `proposed_status` are internally consistent (e.g. `action=approve` requires `proposed_status=approved`) | Inconsistency signals a malformed or tampered file        |
| `D-004`   | Uploader's own `account_id` is not present in the batch                                              | Self-whitelisting prevention (see §8)                                  |
| `D-005`   | Batch does not contain more than 50% `action=approve` rows without at least one `reason_code` present | Bulk blind-approvals without justification are flagged at batch level |

#### Soft warnings (row flagged, batch can proceed)

| Rule ID   | Description                                                                                          | Why soft?                                                                |
|-----------|------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `W-001`   | `account_id` does not match any known subject in the current dataset                                 | May be a new subject being added; approver should confirm                |
| `W-002`   | `proposed_status` is the same as the current status (no-op row)                                      | Not an error, but wasteful; worth surfacing to the approver              |
| `W-003`   | Status transition is unusual (e.g. `approved` → `approved` is no-op; `rejected` → `approved` skips `review`) | Transitions from `rejected` directly to `approved` bypass review; flag for human attention |
| `W-004`   | `jurisdiction` value is not in the expected ISO 3166-1 list                                          | Could be a typo; approver should verify                                  |
| `W-005`   | `effective_date` is in the past                                                                      | Not invalid, but may indicate a stale or replayed file                   |
| `W-006`   | `reason_code` is absent on a `reject` action                                                         | Rejections without a reason are permitted but should be reviewed         |
| `W-007`   | Row count exceeds 100 (within the 500 hard limit)                                                    | Large batches warrant extra scrutiny; surfaced as a batch-level warning  |

### 4.3 Transition validity matrix

| Current status | Proposed status | Result    |
|----------------|-----------------|-----------|
| `pending`      | `approved`      | OK        |
| `pending`      | `rejected`      | OK        |
| `pending`      | `review`        | OK        |
| `approved`     | `rejected`      | W-003     |
| `approved`     | `review`        | OK        |
| `approved`     | `approved`      | W-002     |
| `rejected`     | `approved`      | W-003     |
| `rejected`     | `review`        | OK        |
| `review`       | `approved`      | OK        |
| `review`       | `rejected`      | OK        |
| Any            | same as current | W-002     |

---

## 5. Preview Rules

### 5.1 What the preview must show

The preview is generated after all validation passes (or after warnings are acknowledged). It is **read-only and non-committing** — no state change occurs during preview generation or display.

**Per-row diff:**

Each row in the preview table must show:

| Column            | Description                                                       |
|-------------------|-------------------------------------------------------------------|
| Account ID        | Truncated (first 8 + last 4 chars), full value in tooltip/title   |
| Current status    | Live value from the current dataset (highlighted if missing)      |
| → Proposed status | Value from the CSV, styled by direction (green=approve, red=reject, amber=flag) |
| Action            | Human-readable description of the action being applied            |
| Jurisdiction      | Current → proposed (if changed; blank if unchanged)               |
| Tier              | Current → proposed (if changed; blank if unchanged)               |
| Warnings          | Inline badge for any W-xxx warnings on this row                   |
| Row status        | `valid`, `warning`, or `error` (hard errors should not reach preview) |

**Aggregate summary (top of preview):**

```
12 approve  |  3 reject  |  2 flag for review  |  1 remove
4 warnings  |  0 errors  |  500 → 492 net valid rows
```

### 5.2 Visual distinction rules

- Rows with warnings (`W-xxx`) must be visually distinguishable from clean rows — e.g. amber left border or amber row background.
- Rows flagged with hard errors (should not appear in preview, but defensive) must use a red left border.
- Status change direction should use the same colour system as `ComplianceBadge` already used in the codebase (`emerald` for approved, `rose` for rejected, `sky` for review, `amber` for pending).

### 5.3 Interactivity constraints

- The preview table is **entirely read-only**. Reviewers cannot edit values inline.
- No approve/reject/submit buttons are active until the uploader explicitly confirms submission for review.
- The "Submit for review" action transitions the batch from `draft` → `pending_review` and notifies the approver. **No compliance data changes at this point.**

---

## 6. Review-Before-Signing Assumptions

### 6.1 Maker-checker principle (non-negotiable)

> **No batch may be applied without an explicit human approval step after preview. The person who approves must be different from the person who uploaded the file.**

This is enforced at the application layer. The system must:

1. Record the `uploader_id` (wallet address + authenticated role) at upload time.
2. When an approver attempts to approve, compare `approver_id` to `uploader_id`. If they match, the approval must be rejected with a clear error: _"The uploader and approver must be different people."_
3. The approval action must be logged with `approver_id`, `approved_at` timestamp, and a reference to the batch ID.

### 6.2 Roles

Based on the existing `DashboardRole` system:

| Action       | Required role           | Notes                                           |
|--------------|-------------------------|-------------------------------------------------|
| Upload CSV   | `admin` or `issuer`     | `issuer` may upload for assets they manage      |
| Review/Approve | `admin`               | Approval is a privileged action                 |
| Reject batch | `admin`                 | —                                               |
| View preview | `admin` or `issuer`     | Uploaders can see their own drafts              |
| View audit log | `admin`, `read_only`  | Audit log is always readable by admins          |

> ⚠️ **Open question OQ-01:** Should `issuer` be allowed to upload batches for any subject, or only for subjects associated with their own issued assets? See §9.

### 6.3 What "signing" means — assumption to confirm

This system does not yet have a defined signing mechanism for batch operations. Three options are possible, and the team must confirm which applies:

**Option A — DB-level approval record only**  
An approval record is written to the database with `approver_id`, `batch_id`, and `approved_at`. No cryptographic signature. Simplest to implement, weakest non-repudiation.

**Option B — Freighter wallet signature**  
The approver signs a canonical representation of the batch (e.g. SHA-256 of the batch JSON) using their connected Stellar wallet via `@stellar/freighter-api`. The resulting signature is stored alongside the approval record. Stronger non-repudiation; requires the approver to have their wallet connected.

**Option C — On-chain transaction**  
Each apply operation is submitted as a Soroban contract call, making every state change an on-chain transaction. This gives the strongest audit trail (immutable, publicly verifiable) but is the most expensive and slowest.

> ⚠️ **Open question OQ-02:** Which signing mechanism (A, B, or C) should be used? This document assumes **Option B as a target**, with Option A as an acceptable interim, but the team must confirm. See §9.

Until confirmed, no signing implementation should be built. The `BatchStatus` type in `bulkImport.types.ts` reserves space for a `signatureRef` field regardless of mechanism.

---

## 7. Error Handling

### 7.1 Invalid row policy: whole-batch vs. partial

**Decision: hard errors block the whole batch; soft warnings do not.**

Rationale:

- Hard errors (schema failures, self-whitelisting, duplicate IDs) indicate the file itself is suspect or malformed. Applying partial data from a suspect file risks introducing inconsistency and obscures the problem. The uploader should fix the file and re-upload.
- Soft warnings indicate rows that are unusual but not necessarily wrong. They should be visible in the preview so the approver can make an informed decision. The approver may choose to exclude flagged rows before approving, but the system does not auto-exclude them.

> ⚠️ **Open question OQ-03:** Should the approver be able to manually exclude individual flagged rows from a batch during review, or must they reject the whole batch and ask for a corrected file? See §9.

### 7.2 Error communication to the uploader

| Error type    | Delivery mechanism                                                   |
|---------------|----------------------------------------------------------------------|
| Schema errors | Inline error banner at the top of the upload step, before preview is shown |
| Data errors   | Listed in the preview under a collapsible "Errors" section; entire batch is blocked |
| Row warnings  | Inline per-row badge in the preview table                            |
| Batch-level warnings | Summary chip above the preview table                        |
| Downloadable error report | Available for batches with > 10 errors, as a CSV: columns `row_number`, `account_id`, `rule_id`, `severity`, `message` |

### 7.3 Partial-apply failures

A partial-apply failure occurs when the batch has been approved but a DB or contract write fails mid-batch (e.g. row 40 of 100 fails).

**Policy:**

1. The apply operation is transactional. If a transactional DB is available, wrap the entire batch in a single transaction and roll back on any failure.
2. If a transactional DB is not available (e.g. on-chain, where atomicity per-transaction applies), the system must:
   a. Record which rows were successfully applied and which failed.
   b. Transition the batch to `partially_applied` status.
   c. Notify both the uploader and approver with a report of which rows failed and why.
   d. The remaining failed rows must **not** be retried automatically. A new batch should be created for the failed rows after investigating the cause.
3. The audit log entry for the batch must record `rows_applied`, `rows_failed`, and the failure reason for each failed row.

> ⚠️ **Open question OQ-04:** Is transactional atomicity available in the target persistence layer? See §9.

---

## 8. Security Risks

### 8.1 Malicious CSV / self-whitelisting

**Threat:** An uploader includes their own `account_id` in the batch with `action=approve` to whitelist themselves.

**Mitigation:** Rule `D-004` hard-rejects any batch that contains the uploader's own address. This check is performed server-side (the client check is UX-only and must not be the sole defence).

### 8.2 Privilege escalation via CSV

**Threat:** A malicious CSV attempts to set `proposed_status=approved` for accounts that should remain `rejected`, or uses crafted `reason_code` values to inject content into audit logs.

**Mitigation:**
- `reason_code` and `external_ref` fields are treated as plain text; they are HTML-escaped before display and stripped of any executable content before storage.
- The allowed values for `action` and `proposed_status` are an allowlist enforced by rule `S-008`/`S-009`. Values outside the allowlist are a hard schema reject.
- All values are validated against the allowlist server-side before any write.

### 8.3 Replay of a previously-used file

**Threat:** An attacker replays a legitimate, previously-approved file to re-apply the same whitelist changes (e.g. re-approving accounts that have since been rejected for cause).

**Mitigation:**
- Each uploaded file is hashed (SHA-256) at upload time and the hash is stored in the batch record.
- Before accepting a new upload, the system checks whether a batch with the same hash has been processed in the last 30 days. If found, the upload is rejected with: _"This file has already been used in batch [ID]. Please create a new file."_
- The `effective_date` field is validated; a `W-005` warning is raised if it is in the past, prompting the approver to consider whether the batch is stale.

### 8.4 Mass incorrect status changes from a compromised uploader

**Threat:** A compromised `issuer` or `admin` account uploads a batch that incorrectly rejects or removes a large number of valid accounts.

**Mitigations:**
- **Max batch size** of 500 rows limits the blast radius.
- **Rate limiting**: max 5 batches per user per hour.
- **Maker-checker**: the approver (a different person) must review the diff before any change is applied. A large batch with many `reject` actions should be visually obvious in the preview summary.
- **Audit trail**: every change is logged with before/after values and identities. Incorrect changes can be identified and reversed by creating a corrective batch.
- Rule `D-005` flags batches where > 50% of rows are blind approvals without reason codes.

### 8.5 Required audit trail

The audit log for each batch must be **append-only and immutable** (no update or delete operations on audit records). Each batch audit record must contain:

| Field                  | Description                                                       |
|------------------------|-------------------------------------------------------------------|
| `batch_id`             | Unique identifier for the batch                                   |
| `uploaded_by`          | Wallet address / user ID of the uploader                          |
| `uploaded_at`          | ISO 8601 timestamp                                                |
| `approved_by`          | Wallet address / user ID of the approver                          |
| `approved_at`          | ISO 8601 timestamp                                                |
| `signature_ref`        | Signature or approval record reference (mechanism TBD per OQ-02)  |
| `file_hash`            | SHA-256 of the original uploaded file                             |
| `row_count`            | Total rows in the batch                                           |
| `rows_applied`         | Count of successfully applied rows                                |
| `rows_failed`          | Count of rows that failed to apply                                |
| `per_row_log`          | Array: `{ account_id, status_before, status_after, applied_at, failure_reason? }` |

The per-row log must record both the `status_before` (live at apply time, not at upload time) and `status_after`. This ensures the log reflects the actual change made, not just the intended change.

### 8.6 RBAC assumptions

See §6.2 for the role-to-action mapping. Additionally:

- API endpoints for upload, preview retrieval, and approval must enforce role checks server-side. Client-side role gating (e.g. `RouteGuard`) is UX-only.
- The `read_only` role must not be able to upload or approve batches.
- The `investor` role must not have access to bulk import endpoints at all.

### 8.7 Rate limiting and batch size limits

| Limit                       | Value | Enforcement layer     |
|-----------------------------|-------|-----------------------|
| Max rows per batch          | 500   | Schema check S-006    |
| Max file size               | 2 MB  | Schema check S-007    |
| Max batches per user/hour   | 5     | Server-side rate limiter |
| Max concurrent `pending_review` batches per user | 3 | Application logic |

---

## 9. Open Questions

The following assumptions must be confirmed with the team before implementation begins. They are flagged here rather than assumed to avoid building on a wrong foundation.

| ID     | Question                                                                                                                  | Impact if wrong assumption is made                                      |
|--------|---------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| OQ-01  | Should the `issuer` role be able to upload batches for **any** subject, or only subjects associated with their own assets? | If issuers have global upload access, a compromised issuer account has wider blast radius |
| OQ-02  | Which signing mechanism applies: DB-level approval record (A), Freighter wallet signature (B), or on-chain transaction (C)? | Determines whether `signatureRef` holds a DB ID, a Stellar signature, or a tx hash |
| OQ-03  | Should approvers be able to exclude individual flagged rows from a batch during review, or must they reject the whole batch? | Affects `BatchPreviewRow` type (needs an `excluded` flag) and approval flow complexity |
| OQ-04  | Is transactional atomicity available in the target persistence layer (i.e. can a multi-row batch be rolled back if one row fails)? | Determines whether `partially_applied` batch status is possible or whether it is all-or-nothing |
| OQ-05  | What is the maximum age of a `pending_review` batch before it expires? (e.g. auto-reject after 72 hours?)                 | Determines whether an `expires_at` field is needed on `KycBatchRecord`  |
| OQ-06  | Should `action=remove` remove the subject from the whitelist entirely, or just set their status to a terminal rejected state? | Affects what the per-row audit log records and whether the subject record is deleted or updated |
