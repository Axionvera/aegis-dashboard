import { describe, it, expect } from 'vitest';
import {
  applyAuditLogFilters,
  defaultAuditLogFilters,
  exportAuditLogToCsv,
  exportAuditLogToJson,
  redactAuditEntry,
  type AuditLogEntry,
} from '@/lib/audit';
import { sampleAuditLogEntries } from '@/lib/__fixtures__/auditLog';

describe('applyAuditLogFilters', () => {
  it('returns all entries when filters are defaults', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, defaultAuditLogFilters);
    expect(result).toHaveLength(sampleAuditLogEntries.length);
  });

  it('filters by a single action', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      actions: ['role_change'],
    });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.action === 'role_change')).toBe(true);
  });

  it('filters by multiple actions', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      actions: ['role_change', 'export'],
    });
    expect(result).toHaveLength(3);
  });

  it('filters by query matching actor', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      query: 'GCFXADMIN',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) => e.actor.includes('GCFXADMIN'))).toBe(true);
  });

  it('filters by query matching action name', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      query: 'settings',
    });
    expect(result.every((e) => e.action === 'settings_change')).toBe(true);
  });

  it('filters by query matching target', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      query: 'batch:kyc',
    });
    expect(result).toHaveLength(1);
    expect(result[0].target).toBe('batch:kyc-2026-07-28');
  });

  it('filters by query matching details', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      query: 'heartbeat',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('audit-006');
  });

  it('filters by dateFrom', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      dateFrom: '2026-07-28T09:00:00.000Z',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) => e.timestamp >= '2026-07-28T09:00:00.000Z')).toBe(true);
  });

  it('filters by dateTo', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      dateTo: '2026-07-28T07:00:00.000Z',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) => e.timestamp <= '2026-07-28T07:00:00.000Z')).toBe(true);
  });

  it('filters by date range', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      dateFrom: '2026-07-28T09:00:00.000Z',
      dateTo: '2026-07-28T10:00:00.000Z',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) =>
      e.timestamp >= '2026-07-28T09:00:00.000Z' &&
      e.timestamp <= '2026-07-28T10:00:00.000Z'
    )).toBe(true);
  });

  it('combines action, query, and date filters', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      query: 'admin',
      actions: ['role_change'],
      dateFrom: '2026-07-01T00:00:00.000Z',
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((e) => e.action === 'role_change')).toBe(true);
    expect(result.every((e) => e.timestamp >= '2026-07-01T00:00:00.000Z')).toBe(true);
  });

  it('returns empty when no entries match', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      query: 'zzzz-no-match',
    });
    expect(result).toHaveLength(0);
  });

  it('returns all entries for whitespace-only query', () => {
    const result = applyAuditLogFilters(sampleAuditLogEntries, {
      ...defaultAuditLogFilters,
      query: '   ',
    });
    expect(result).toHaveLength(sampleAuditLogEntries.length);
  });

  it('returns empty for empty entries array', () => {
    const result = applyAuditLogFilters([], defaultAuditLogFilters);
    expect(result).toHaveLength(0);
  });
});

describe('exportAuditLogToCsv', () => {
  it('produces correct CSV with headers and data rows', () => {
    const csv = exportAuditLogToCsv(sampleAuditLogEntries);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('\ufeff# Protocol-level compliance information. Not legal, regulatory, or financial advice.');
    expect(lines[1]).toBe('id,actor,action,target,timestamp,details,source');
    expect(lines[2]).toContain('audit-001');
    expect(lines[2]).toContain('GCFXADMIN');
    expect(lines[2]).toContain('role_change');
  });

  it('omits disclaimer when includeDisclaimer is false', () => {
    const csv = exportAuditLogToCsv(sampleAuditLogEntries, { includeDisclaimer: false });
    expect(csv.startsWith('\ufeffid,actor')).toBe(true);
    expect(csv).not.toContain('Protocol-level compliance');
  });

  it('includes metadata column when includeMetadata is true', () => {
    const csv = exportAuditLogToCsv(sampleAuditLogEntries, { includeMetadata: true });
    const headers = csv.split('\n')[1];
    expect(headers).toBe('id,actor,action,target,timestamp,details,source,metadata');
  });

  it('escapes comma in details field', () => {
    const entry: AuditLogEntry = {
      id: 'test-001',
      actor: 'ACTOR',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
      details: 'Value A, Value B, Value C',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    expect(csv).toContain('"Value A, Value B, Value C"');
  });

  it('escapes double quotes in details field', () => {
    const entry: AuditLogEntry = {
      id: 'test-002',
      actor: 'ACTOR',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
      details: 'He said "hello"',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    expect(csv).toContain('"He said ""hello"""');
  });

  it('prevents CSV injection for values starting with =', () => {
    const entry: AuditLogEntry = {
      id: '=SUM(A1:A10)',
      actor: 'ACTOR',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    const idCol = csv.split('\n')[1].split(',')[0];
    expect(idCol).toBe('\t=SUM(A1:A10)');
  });

  it('prevents CSV injection for values starting with +', () => {
    const entry: AuditLogEntry = {
      id: 'test',
      actor: '+123456',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    const actorCol = csv.split('\n')[1].split(',')[1];
    expect(actorCol).toBe('\t+123456');
  });

  it('prevents CSV injection for values starting with -', () => {
    const entry: AuditLogEntry = {
      id: 'test',
      actor: 'ACTOR',
      action: 'system',
      target: '-700',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    const targetCol = csv.split('\n')[1].split(',')[3];
    expect(targetCol).toBe('\t-700');
  });

  it('prevents CSV injection for values starting with @', () => {
    const entry: AuditLogEntry = {
      id: 'test',
      actor: 'ACTOR',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
      details: '@SUM(1+1)*cmd',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    const detailsCol = csv.split('\n')[1].split(',')[5];
    expect(detailsCol).toBe('\t@SUM(1+1)*cmd');
  });

  it('handles undefined optional fields as empty', () => {
    const entry: AuditLogEntry = {
      id: 'test-003',
      actor: 'ACTOR',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const csv = exportAuditLogToCsv([entry], { includeDisclaimer: false });
    const row = csv.split('\n')[1];
    const cols = row.split(',');
    expect(cols).toHaveLength(7);
    expect(cols[5]).toBe('');
    expect(cols[6]).toBe('');
  });

  it('handles empty entries array', () => {
    const csv = exportAuditLogToCsv([]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('\ufeff# Protocol-level compliance information. Not legal, regulatory, or financial advice.');
    expect(lines[1]).toBe('id,actor,action,target,timestamp,details,source');
    expect(lines).toHaveLength(2);
  });

  it('includes UTF-8 BOM at start', () => {
    const csv = exportAuditLogToCsv(sampleAuditLogEntries);
    expect(csv.charCodeAt(0)).toBe(0xFEFF);
  });
});

describe('exportAuditLogToJson', () => {
  it('produces correct JSON with disclaimer wrapper', () => {
    const json = exportAuditLogToJson(sampleAuditLogEntries);
    const parsed = JSON.parse(json);
    expect(parsed.disclaimer).toBe('Protocol-level compliance information. Not legal, regulatory, or financial advice.');
    expect(parsed.entries).toHaveLength(sampleAuditLogEntries.length);
  });

  it('omits disclaimer when includeDisclaimer is false', () => {
    const json = exportAuditLogToJson(sampleAuditLogEntries, { includeDisclaimer: false });
    const parsed = JSON.parse(json);
    expect(parsed.disclaimer).toBeUndefined();
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(sampleAuditLogEntries.length);
  });

  it('excludes metadata when includeMetadata is false', () => {
    const json = exportAuditLogToJson(sampleAuditLogEntries, { includeDisclaimer: false });
    const parsed = JSON.parse(json);
    for (const entry of parsed) {
      expect(entry.metadata).toBeUndefined();
    }
  });

  it('includes metadata when includeMetadata is true', () => {
    const json = exportAuditLogToJson(sampleAuditLogEntries, {
      includeDisclaimer: false,
      includeMetadata: true,
    });
    const parsed = JSON.parse(json);
    const withMeta = parsed.find((e: AuditLogEntry) => e.id === 'audit-003');
    expect(withMeta.metadata).toBeDefined();
    expect(withMeta.metadata.rowsApplied).toBe(118);
  });

  it('handles empty entries array', () => {
    const json = exportAuditLogToJson([]);
    const parsed = JSON.parse(json);
    expect(parsed.disclaimer).toBeDefined();
    expect(parsed.entries).toHaveLength(0);
  });

  it('produces valid JSON with metadata and disclaimer', () => {
    const json = exportAuditLogToJson(sampleAuditLogEntries, { includeMetadata: true });
    const parsed = JSON.parse(json);
    expect(parsed.disclaimer).toBeDefined();
    const withMeta = parsed.entries.find((e: AuditLogEntry) => e.id === 'audit-003');
    expect(withMeta.metadata).toBeDefined();
  });
});

describe('redactAuditEntry', () => {
  const entry: AuditLogEntry = {
    id: 'test-redact',
    actor: 'GCFXADMIN00000000000000000000000000000000000000000000',
    action: 'settings_change',
    target: 'GCFXUSERBOB0000000000000000000000000000000000000000000',
    timestamp: '2026-07-28T12:00:00.000Z',
    details: 'Changed limit from 10000 to 25000',
    source: 'admin-panel',
  };

  it('redacts actor address when actor option is true', () => {
    const result = redactAuditEntry(entry, { actor: true });
    expect(result.actor).toBe('GCFXA...0000');
    expect(result.actor).not.toBe(entry.actor);
  });

  it('redacts target when target option is true', () => {
    const result = redactAuditEntry(entry, { target: true });
    expect(result.target).toBe('GCFXU...0000');
    expect(result.target).not.toBe(entry.target);
  });

  it('redacts details when details option is true', () => {
    const result = redactAuditEntry(entry, { details: true });
    expect(result.details).toBe('[redacted]');
  });

  it('truncates long fields when maxFieldLength is set', () => {
    const long: AuditLogEntry = {
      ...entry,
      actor: 'A'.repeat(100),
      target: 'B'.repeat(100),
    };
    const result = redactAuditEntry(long, { maxFieldLength: 20 });
    expect(result.actor).toBe('A'.repeat(17) + '...');
    expect(result.actor).toHaveLength(20);
    expect(result.target).toBe('B'.repeat(17) + '...');
    expect(result.target).toHaveLength(20);
  });

  it('returns entry unchanged when all options are false/default', () => {
    const result = redactAuditEntry(entry);
    expect(result).toEqual(entry);
  });

  it('handles undefined details field', () => {
    const noDetails: AuditLogEntry = {
      id: 'test-nodeets',
      actor: 'ACTOR',
      action: 'system',
      target: 'TARGET',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const result = redactAuditEntry(noDetails, { details: true });
    expect(result.details).toBe('[redacted]');
  });

  it('can combine actor, target, and details redaction', () => {
    const result = redactAuditEntry(entry, {
      actor: true,
      target: true,
      details: true,
    });
    expect(result.actor).not.toBe(entry.actor);
    expect(result.target).not.toBe(entry.target);
    expect(result.details).toBe('[redacted]');
    expect(result.id).toBe(entry.id);
    expect(result.action).toBe(entry.action);
    expect(result.timestamp).toBe(entry.timestamp);
  });
});
