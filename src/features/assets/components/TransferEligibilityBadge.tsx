import { CheckCircle2, XCircle, HelpCircle, type LucideIcon } from 'lucide-react';
import type { TransferEligibility, TransferEligibilityState } from '@/lib/aegis/types';

const CONFIG: Record<TransferEligibilityState, { label: string; className: string; Icon: LucideIcon }> = {
  eligible: { label: 'Transfer eligible', className: 'text-emerald-700', Icon: CheckCircle2 },
  ineligible: { label: 'Transfer restricted', className: 'text-red-700', Icon: XCircle },
  unknown: { label: 'Eligibility unknown', className: 'text-slate-500', Icon: HelpCircle },
};

interface TransferEligibilityBadgeProps {
  eligibility: TransferEligibility;
}

export default function TransferEligibilityBadge({ eligibility }: TransferEligibilityBadgeProps) {
  const { label, className, Icon } = CONFIG[eligibility.state];

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium ${className}`}
      title={eligibility.reasons.join(' ') || undefined}
    >
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );
}
