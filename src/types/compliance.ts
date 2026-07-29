import {
  CheckCircle,
  Clock,
  Ban,
  HelpCircle,
  ShieldOff,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';

/**
 * Static reference legend statuses (asset/reference UI).
 *
 * Address-level panel statuses for Issue #175 live in
 * `src/features/compliance/types.ts` and include the same public set with
 * protocol-safe copy owned by `statusMap.ts`.
 */
export type ComplianceStatus =
  | 'approved'
  | 'revoked'
  | 'pending'
  | 'blocked'
  | 'unknown'
  | 'unavailable';

interface ComplianceConfigEntry {
  label: string;
  textColor: string;
  bgColor: string;
  icon: LucideIcon;
  explanation: string;
}

export const COMPLIANCE_CONFIG: Record<ComplianceStatus, ComplianceConfigEntry> = {
  approved: {
    label: 'Approved',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    icon: CheckCircle,
    explanation:
      'This item is currently marked approved in the protocol compliance registry.',
  },
  revoked: {
    label: 'Revoked',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    icon: ShieldOff,
    explanation:
      'Prior protocol approval for this item has been revoked in the compliance registry.',
  },
  pending: {
    label: 'Pending',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: Clock,
    explanation: 'This item is currently under protocol compliance review.',
  },
  blocked: {
    label: 'Blocked',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: Ban,
    explanation:
      'This item is currently blocked from protocol actions by the compliance registry.',
  },
  unknown: {
    label: 'Unknown',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: HelpCircle,
    explanation: 'No clear protocol compliance record is available for this item.',
  },
  unavailable: {
    label: 'Unavailable',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: WifiOff,
    explanation: 'Compliance data for this item could not be retrieved right now.',
  },
};
