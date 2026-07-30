import React from 'react';
import { statusForDiagnostics, type DiagnosticsCardStatus } from '@/lib/status/domainMappers';
import { toneClassName } from '@/lib/status/toneStyles';

interface StatusCardProps {
  title: string;
  value: string;
  status: DiagnosticsCardStatus;
}

/**
 * Uses the shared status system (src/lib/status) for colour, so "warning"
 * or "error" here always match the same tone used on the compliance,
 * asset, transaction, and wallet screens. See docs/status-system.md.
 */
export default function StatusCard({ title, value, status }: StatusCardProps) {
  const { tone } = statusForDiagnostics(status);

  return (
    <div className={`p-4 rounded-md border ${toneClassName(tone, 'card')}`}>
      <h3 className="font-semibold text-sm mb-1 opacity-80">{title}</h3>
      <p className="font-mono text-sm break-all">{value}</p>
    </div>
  );
}
