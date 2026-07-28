import type { ComplianceState, ComplianceStatus } from '@/lib/aegis/types';

const STYLES: Record<ComplianceState, string> = {
  compliant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  restricted: 'bg-red-50 text-red-700 border-red-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
};

interface ComplianceBadgeProps {
  compliance: ComplianceStatus;
}

export default function ComplianceBadge({ compliance }: ComplianceBadgeProps) {
  return (
    <span
      title={compliance.detail}
      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded border whitespace-nowrap ${STYLES[compliance.state]}`}
    >
      {compliance.label}
    </span>
  );
}
