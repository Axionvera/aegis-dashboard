import {
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  HelpCircle,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';

export type ComplianceStatus =
  | 'approved'
  | 'not-approved'
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
    explanation: 'This asset has been fully approved for trading.',
  },
  'not-approved': {
    label: 'Not Approved',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: XCircle,
    explanation: 'This asset has been reviewed and denied approval.',
  },
  pending: {
    label: 'Pending',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: Clock,
    explanation: 'This asset is currently under compliance review.',
  },
  blocked: {
    label: 'Blocked',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: Ban,
    explanation: 'This asset has been blocked due to regulatory restrictions.',
  },
  unknown: {
    label: 'Unknown',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: HelpCircle,
    explanation: 'The compliance status of this asset is not yet determined.',
  },
  unavailable: {
    label: 'Unavailable',
    textColor: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: WifiOff,
    explanation: 'Compliance data for this asset is temporarily unavailable.',
  },
};
