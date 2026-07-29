import type { AuditLogEntry } from '@/lib/audit';

/**
 * Sample audit log entries covering every action type and edge case.
 *
 * All wallet addresses are synthetic mock addresses — they do not represent
 * real accounts. Timestamps are illustrative ISO 8601 values.
 */
export const sampleAuditLogEntries: AuditLogEntry[] = [
  {
    id: 'audit-001',
    actor: 'GCFXADMIN00000000000000000000000000000000000000000000',
    action: 'role_change',
    target: 'GCFXUSERALICE0000000000000000000000000000000000000000',
    timestamp: '2026-07-28T10:00:00.000Z',
    details: 'Promoted from viewer to operator',
    source: 'admin-panel',
  },
  {
    id: 'audit-002',
    actor: 'GCFXADMIN00000000000000000000000000000000000000000000',
    action: 'settings_change',
    target: 'feature:transfer-window',
    timestamp: '2026-07-28T09:45:00.000Z',
    details: 'Transfer window extended to 23:59 UTC',
    source: 'settings',
  },
  {
    id: 'audit-003',
    actor: 'SYSTEM',
    action: 'bulk_import',
    target: 'batch:kyc-2026-07-28',
    timestamp: '2026-07-28T09:30:00.000Z',
    details: '120 rows processed, 118 applied, 2 failed',
    source: 'kyc-bulk-import',
    metadata: { rowsApplied: 118, rowsFailed: 2, fileHash: 'abc123' },
  },
  {
    id: 'audit-004',
    actor: 'GCFXADMIN00000000000000000000000000000000000000000000',
    action: 'compliance_update',
    target: 'GCFXUSERBOB0000000000000000000000000000000000000000000',
    timestamp: '2026-07-28T09:15:00.000Z',
    details: 'Status changed from pending to approved',
  },
  {
    id: 'audit-005',
    actor: 'GCFXADMIN00000000000000000000000000000000000000000000',
    action: 'export',
    target: 'audit:2026-07',
    timestamp: '2026-07-28T08:00:00.000Z',
    details: 'Exported audit log for July 2026',
    source: 'audit-log',
  },
  {
    id: 'audit-006',
    actor: 'SYSTEM',
    action: 'system',
    target: 'contract:kyc-oracle',
    timestamp: '2026-07-28T07:00:00.000Z',
    details: 'KYC oracle heartbeat missed — auto-restarted',
    source: 'monitoring',
  },
  {
    id: 'audit-007',
    actor: 'GCFXUSERALICE0000000000000000000000000000000000000000',
    action: 'role_change',
    target: 'self',
    timestamp: '2026-07-22T14:30:00.000Z',
    details: 'Profile updated: notification preferences',
    metadata: { previousRole: 'viewer', newRole: 'operator' },
  },
  {
    id: 'audit-008',
    actor: 'GCFXADMIN00000000000000000000000000000000000000000000',
    action: 'settings_change',
    target: 'flag:early-mint',
    timestamp: '2026-07-01T12:00:00.000Z',
    details: 'Enabled early mint feature flag',
    source: 'feature-flags',
    metadata: { previousValue: false, newValue: true },
  },
];
