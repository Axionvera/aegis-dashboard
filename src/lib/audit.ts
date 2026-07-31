import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';

export type AuditLogAction =
  | 'role_change'
  | 'compliance_update'
  | 'settings_change'
  | 'bulk_import'
  | 'system'
  | 'export';

export const AUDIT_LOG_ACTIONS: AuditLogAction[] = [
  'role_change',
  'compliance_update',
  'settings_change',
  'bulk_import',
  'system',
  'export',
];

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: AuditLogAction;
  target: string;
  timestamp: string;
  details?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  query: string;
  actions: AuditLogAction[];
  dateFrom?: string;
  dateTo?: string;
}

export const defaultAuditLogFilters: AuditLogFilters = {
  query: '',
  actions: [],
};

export const applyAuditLogFilters = (
  entries: AuditLogEntry[],
  filters: AuditLogFilters,
): AuditLogEntry[] => {
  const query = filters.query.trim().toLowerCase();

  return entries.filter((entry) => {
    const actionMatches =
      filters.actions.length === 0 || filters.actions.includes(entry.action);

    const dateFromMatches =
      !filters.dateFrom || entry.timestamp >= filters.dateFrom;

    const dateToMatches =
      !filters.dateTo || entry.timestamp <= filters.dateTo;

    const queryMatches =
      query.length === 0 ||
      entry.actor.toLowerCase().includes(query) ||
      entry.action.toLowerCase().includes(query) ||
      entry.target.toLowerCase().includes(query) ||
      (entry.details ? entry.details.toLowerCase().includes(query) : false);

    return actionMatches && queryMatches && dateFromMatches && dateToMatches;
  });
};

export interface ExportOptions {
  includeDisclaimer?: boolean;
  includeMetadata?: boolean;
}

export interface RedactOptions {
  actor?: boolean;
  target?: boolean;
  details?: boolean;
  maxFieldLength?: number;
}

const CSV_HEADERS = ['id', 'actor', 'action', 'target', 'timestamp', 'details', 'source'];
const UTF8_BOM = '\uFEFF';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function preventInjection(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `\t${value}`;
  }
  return value;
}

function formatCsvField(value: string | undefined | null): string {
  if (value == null) return '';
  const escaped = csvEscape(String(value));
  return preventInjection(escaped);
}

export function exportAuditLogToCsv(
  entries: AuditLogEntry[],
  options: ExportOptions = {},
): string {
  const { includeDisclaimer = true, includeMetadata = false } = options;
  const lines: string[] = [];

  const headers = includeMetadata ? [...CSV_HEADERS, 'metadata'] : CSV_HEADERS;

  if (includeDisclaimer) {
    lines.push(`# ${COMPLIANCE_DISCLAIMER}`);
  }

  lines.push(headers.map(formatCsvField).join(','));

  for (const entry of entries) {
    const row = [
      formatCsvField(entry.id),
      formatCsvField(entry.actor),
      formatCsvField(entry.action),
      formatCsvField(entry.target),
      formatCsvField(entry.timestamp),
      formatCsvField(entry.details),
      formatCsvField(entry.source),
    ];

    if (includeMetadata) {
      row.push(formatCsvField(entry.metadata ? JSON.stringify(entry.metadata) : ''));
    }

    lines.push(row.join(','));
  }

  return UTF8_BOM + lines.join('\n');
}

export function exportAuditLogToJson(
  entries: AuditLogEntry[],
  options: ExportOptions = {},
): string {
  const { includeDisclaimer = true, includeMetadata = false } = options;

  const data = includeMetadata
    ? entries
    : entries.map(({ metadata, ...rest }) => rest);

  if (includeDisclaimer) {
    return JSON.stringify({ disclaimer: COMPLIANCE_DISCLAIMER, entries: data }, null, 2);
  }

  return JSON.stringify(data, null, 2);
}

export function redactAuditEntry(
  entry: AuditLogEntry,
  options: RedactOptions = {},
): AuditLogEntry {
  const {
    actor: redactActor = false,
    target: redactTarget = false,
    details: redactDetails = false,
    maxFieldLength = Infinity,
  } = options;

  const truncate = (value: string, max: number): string =>
    value.length > max ? value.slice(0, max - 3) + '...' : value;

  return {
    ...entry,
    actor: redactActor
      ? truncateAddress(entry.actor)
      : truncate(entry.actor, maxFieldLength),
    target: redactTarget
      ? truncateAddress(entry.target)
      : truncate(entry.target, maxFieldLength),
    details: redactDetails
      ? '[redacted]'
      : entry.details
        ? truncate(entry.details, maxFieldLength)
        : entry.details,
  };
}

function truncateAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}
