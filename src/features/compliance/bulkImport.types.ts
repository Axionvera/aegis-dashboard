/**
 * bulkImport.types.ts
 *
 * TypeScript type contracts for the KYC whitelist bulk import workflow.
 *
 * IMPORTANT: This file contains ONLY interfaces, types, and enums.
 * No functions, no API calls, no state logic.
 *
 * These types are the authoritative machine-readable companion to
 * docs/kyc-bulk-import-design.md. Any changes to the CSV spec or
 * validation rules must be reflected here and vice-versa.
 *
 * All column names match the CSV spec in §3.2 of the design doc exactly.
 */

import type { DashboardRole } from '@/features/auth/types';

// ---------------------------------------------------------------------------
// CSV schema constants (mirrors §3.2 and §3.3 of the design doc)
// ---------------------------------------------------------------------------

/** Supported CSV schema versions. Reject any file whose schema_version is not in this union. */
export type CsvSchemaVersion = '1.0';

/** Actions the CSV may request on a subject. Maps to BulkAction in complianceReview. */
export type CsvImportAction = 'approve' | 'reject' | 'flag_review' | 'remove';

/**
 * KYC status values that may appear in proposed_status.
 * Kept in sync with ComplianceStatus in src/lib/complianceReview.ts.
 */
export type KycComplianceStatus = 'approved' | 'rejected' | 'review' | 'pending';

/** Tier values permitted in the tier column. */
export type SubjectTier = 'retail' | 'accredited' | 'professional' | 'unknown';

// ---------------------------------------------------------------------------
// 1. Raw parsed CSV row shape
//    Represents one data row exactly as it comes out of the CSV parser —
//    all fields are strings (or undefined for missing optional columns).
//    No validation has been applied yet.
// ---------------------------------------------------------------------------

export interface RawCsvRow {
  /** Column 1 — must equal a supported CsvSchemaVersion */
  schema_version: string;
  /** Column 2 — Stellar address or stable entity ID */
  account_id: string;
  /** Column 3 — what to do to this subject */
  action: string;
  /** Column 4 — target status after the action is applied */
  proposed_status: string;
  /** Column 5 — ISO 3166-1 alpha-2 jurisdiction code (optional) */
  jurisdiction?: string;
  /** Column 6 — subject tier (optional) */
  tier?: string;
  /** Column 7 — human-readable reason, max 120 chars (optional) */
  reason_code?: string;
  /** Column 8 — ISO 8601 date YYYY-MM-DD (optional) */
  effective_date?: string;
  /** Column 9 — KYC provider reference / case ID, max 80 chars (optional) */
  external_ref?: string;
  /** 1-based position in the file (after header). Used for error reporting. */
  _rowNumber: number;
}

// ---------------------------------------------------------------------------
// 2. Validated row shape (post-validation)
//    Produced only when a row passes all hard-reject and schema checks.
//    Fields have been coerced to their correct types.
// ---------------------------------------------------------------------------

export interface ValidatedCsvRow {
  /** Stable subject identifier (verified non-empty, format-checked). */
  accountId: string;
  /** Parsed and validated action. */
  action: CsvImportAction;
  /** Parsed and validated proposed status. */
  proposedStatus: KycComplianceStatus;
  /** Validated ISO 3166-1 alpha-2 code, or undefined if absent. */
  jurisdiction?: string;
  /** Parsed tier, or undefined if absent. */
  tier?: SubjectTier;
  /** Sanitised reason code (HTML-escaped, length-checked), or undefined. */
  reasonCode?: string;
  /** Parsed Date object from effective_date, or undefined. */
  effectiveDate?: string; // kept as ISO string; caller constructs Date if needed
  /** Sanitised external reference, or undefined. */
  externalRef?: string;
  /** Original 1-based row number for traceability back to the source file. */
  rowNumber: number;
  /** Any soft warnings (W-xxx rule IDs) triggered by this row. */
  warnings: ValidationWarning[];
}

// ---------------------------------------------------------------------------
// 3. Preview diff shape
//    One entry per validated row in the preview table.
//    Shows current (live) value → proposed value so the approver can see
//    exactly what will change. Read-only; does not commit anything.
// ---------------------------------------------------------------------------

/** Visual row status in the preview table. */
export type PreviewRowStatus = 'valid' | 'warning' | 'error';

/** A single field-level diff: what is the value now vs what the CSV proposes. */
export interface FieldDiff<T> {
  current: T | null; // null means the field has no current value (new subject)
  proposed: T;
  changed: boolean;  // true when current !== proposed
}

/** The full diff for one row in the preview table. */
export interface BatchPreviewRow {
  /** Truncated account ID for display (full value in accountIdFull). */
  accountIdDisplay: string;
  /** Full account ID for tooltip / aria-label. */
  accountIdFull: string;
  /** Status diff: current live status → proposed status from CSV. */
  statusDiff: FieldDiff<KycComplianceStatus>;
  /** Jurisdiction diff (only populated when the CSV provides a value). */
  jurisdictionDiff?: FieldDiff<string>;
  /** Tier diff (only populated when the CSV provides a value). */
  tierDiff?: FieldDiff<SubjectTier>;
  /** Human-readable action label derived from CsvImportAction. */
  actionLabel: string;
  /** Raw action value for programmatic use. */
  action: CsvImportAction;
  /** Soft warnings on this row (W-xxx). */
  warnings: ValidationWarning[];
  /** Overall row status for visual styling in the preview table. */
  rowStatus: PreviewRowStatus;
  /** Original 1-based row number for download error reports. */
  rowNumber: number;
  /**
   * Whether the approver has manually excluded this row from the batch.
   * Only relevant if OQ-03 is resolved in favour of per-row exclusion.
   * @see docs/kyc-bulk-import-design.md §9 OQ-03
   */
  excluded?: boolean;
}

/** Aggregate summary shown above the preview table. */
export interface BatchPreviewSummary {
  totalRows: number;
  approveCount: number;
  rejectCount: number;
  flagReviewCount: number;
  removeCount: number;
  warningCount: number;
  /** Always 0 in a valid preview (hard errors block preview generation). */
  errorCount: number;
  /** Rows that will actually be applied (total minus excluded, if OQ-03 permits exclusion). */
  netApplicableRows: number;
}

/** The full preview payload returned to the UI. */
export interface BatchPreview {
  batchId: string;
  summary: BatchPreviewSummary;
  rows: BatchPreviewRow[];
  /** ISO 8601 timestamp when this preview was generated. */
  generatedAt: string;
  /**
   * True only when all hard errors are resolved and the batch is safe to
   * submit for review. Approve/reject buttons must remain disabled until
   * this is true.
   */
  canSubmitForReview: boolean;
}

// ---------------------------------------------------------------------------
// 4. Batch status enum
//    Tracks the lifecycle of a submitted batch from upload to audit log.
// ---------------------------------------------------------------------------

/**
 * Lifecycle states of a KYC bulk import batch.
 *
 *   draft            → Uploaded, validation passed, preview generated.
 *                       No state change has occurred. Uploader can discard.
 *   pending_review   → Uploader submitted for review. Awaiting approver action.
 *                       Still no compliance data change.
 *   approved         → Approver approved the batch (maker-checker complete).
 *                       Apply operation is queued or in progress.
 *   rejected         → Approver rejected the batch. No changes applied.
 *                       Uploader must create a new batch.
 *   applying         → Apply operation is in progress (rows being written).
 *   applied          → All rows successfully written. Audit log complete.
 *   partially_applied→ Apply completed but some rows failed. See audit log.
 *                       @see docs/kyc-bulk-import-design.md §7.3
 *   expired          → Batch aged out of pending_review without approver action.
 *                       @see docs/kyc-bulk-import-design.md §9 OQ-05
 *   failed           → Apply operation failed before any rows were written.
 */
export type BatchStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'applying'
  | 'applied'
  | 'partially_applied'
  | 'expired'
  | 'failed';

/** The persisted record for a KYC bulk import batch. */
export interface KycBatchRecord {
  batchId: string;
  status: BatchStatus;
  /** Wallet address of the person who uploaded the file. */
  uploadedBy: string;
  /** Role of the uploader at time of upload. */
  uploaderRole: DashboardRole;
  /** ISO 8601 timestamp of upload. */
  uploadedAt: string;
  /** SHA-256 hex digest of the original uploaded file. Used for replay detection. */
  fileHash: string;
  /** Original filename as provided by the browser (for display only). */
  originalFilename: string;
  /** Parsed schema version from the file. */
  schemaVersion: CsvSchemaVersion;
  /** Total data rows in the file. */
  rowCount: number;
  /**
   * Identity of the approver, set when status transitions to `approved` or `rejected`.
   * Must differ from `uploadedBy` (maker-checker rule).
   */
  approvedBy?: string;
  /** ISO 8601 timestamp of the approval or rejection decision. */
  approvedAt?: string;
  /**
   * Reference to the approval signature or DB approval record.
   * Exact format depends on the signing mechanism resolved in OQ-02.
   * @see docs/kyc-bulk-import-design.md §6.3
   */
  signatureRef?: string;
  /** Number of rows successfully written during apply. */
  rowsApplied?: number;
  /** Number of rows that failed during apply. */
  rowsFailed?: number;
  /**
   * ISO 8601 timestamp after which a pending_review batch auto-expires.
   * Only present if OQ-05 is resolved with a defined TTL.
   * @see docs/kyc-bulk-import-design.md §9 OQ-05
   */
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// 5. Validation error / warning shape
// ---------------------------------------------------------------------------

/** Severity of a validation finding. Hard errors block the batch; warnings do not. */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Hard-reject rule IDs (schema-level, §4.1) and data-level (§4.2).
 * Any finding with one of these IDs blocks the entire batch.
 */
export type HardRejectRuleId =
  | 'S-001' // Encoding not UTF-8
  | 'S-002' // Delimiter not comma
  | 'S-003' // Missing required header columns
  | 'S-004' // Unsupported schema_version
  | 'S-005' // No data rows
  | 'S-006' // Exceeds 500-row limit
  | 'S-007' // Exceeds 2 MB file size limit
  | 'S-008' // proposed_status value not in allowlist
  | 'S-009' // action value not in allowlist
  | 'S-010' // effective_date not valid ISO 8601
  | 'D-001' // account_id is empty
  | 'D-002' // Duplicate account_id in same file
  | 'D-003' // action / proposed_status internally inconsistent
  | 'D-004' // Uploader's own account_id present in batch (self-whitelisting)
  | 'D-005' // > 50% approve rows with no reason_code in batch
  ;

/**
 * Soft-warning rule IDs (§4.2).
 * Findings with these IDs are surfaced to the approver but do not block the batch.
 */
export type SoftWarningRuleId =
  | 'W-001' // account_id not found in current dataset (may be new)
  | 'W-002' // No-op: proposed_status equals current status
  | 'W-003' // Unusual status transition (e.g. rejected → approved)
  | 'W-004' // jurisdiction not in expected ISO 3166-1 list
  | 'W-005' // effective_date is in the past
  | 'W-006' // reject action has no reason_code
  | 'W-007' // Row count exceeds 100 (batch-level warning)
  ;

export type ValidationRuleId = HardRejectRuleId | SoftWarningRuleId;

/** A single validation finding, attached to either the batch or a specific row. */
export interface ValidationFinding {
  ruleId: ValidationRuleId;
  severity: ValidationSeverity;
  /** Human-readable explanation of why this rule fired. */
  message: string;
  /**
   * 1-based row number this finding relates to, or undefined for batch-level findings.
   * Matches RawCsvRow._rowNumber and ValidatedCsvRow.rowNumber.
   */
  rowNumber?: number;
  /** The account_id value of the offending row, if applicable. */
  accountId?: string;
}

/** A finding with severity === 'warning'. Type guard alias for clarity. */
export type ValidationWarning = ValidationFinding & { severity: 'warning' };

/** A finding with severity === 'error'. Type guard alias for clarity. */
export type ValidationError = ValidationFinding & { severity: 'error' };

/** The complete result returned after running all validation phases. */
export interface ValidationResult {
  /** True only when there are zero hard errors (batch can proceed to preview). */
  isValid: boolean;
  /** All findings, errors and warnings combined. */
  findings: ValidationFinding[];
  /** Convenience: findings where severity === 'error'. */
  errors: ValidationError[];
  /** Convenience: findings where severity === 'warning'. */
  warnings: ValidationWarning[];
  /** Rows that passed validation (empty if isValid is false). */
  validatedRows: ValidatedCsvRow[];
  /**
   * For download error reports: the same findings as a CSV-serialisable shape.
   * Only populated when errors.length > 10 (per §7.2 of the design doc).
   */
  errorReportRows?: ErrorReportRow[];
}

/** One row in the downloadable error report CSV (§7.2). */
export interface ErrorReportRow {
  row_number: number;
  account_id: string;
  rule_id: ValidationRuleId;
  severity: ValidationSeverity;
  message: string;
}

// ---------------------------------------------------------------------------
// 6. Audit log shape (§8.5)
// ---------------------------------------------------------------------------

/** Per-row entry in the immutable audit log written after apply. */
export interface AuditRowEntry {
  /** Subject identifier. */
  accountId: string;
  /**
   * Status at the moment the apply operation ran (not at upload time).
   * null if the subject did not exist before this batch.
   */
  statusBefore: KycComplianceStatus | null;
  /** Status written by this batch. null if the row failed to apply. */
  statusAfter: KycComplianceStatus | null;
  /** ISO 8601 timestamp when this individual row was applied. */
  appliedAt?: string;
  /** Reason the row failed to apply, if applicable. */
  failureReason?: string;
}

/** The complete, immutable audit record for a batch. */
export interface KycBatchAuditRecord {
  batchId: string;
  uploadedBy: string;
  uploadedAt: string;
  approvedBy: string;
  approvedAt: string;
  /** Signing mechanism reference — format TBD per OQ-02. */
  signatureRef: string;
  /** SHA-256 hex digest of the original file, for replay detection. */
  fileHash: string;
  rowCount: number;
  rowsApplied: number;
  rowsFailed: number;
  /** Per-row log. Must be append-only and never mutated after creation. */
  perRowLog: AuditRowEntry[];
}
