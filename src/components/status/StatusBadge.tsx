import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MinusCircle,
  type LucideIcon,
} from 'lucide-react';
import type { StatusInfo, StatusTone } from '@/lib/status/types';
import { toneClassName } from '@/lib/status/toneStyles';

const TONE_ICON: Record<StatusTone, LucideIcon> = {
  success: CheckCircle2,
  neutral: MinusCircle,
  caution: AlertTriangle,
  critical: XCircle,
  unknown: HelpCircle,
};

/**
 * Badge-shaped variants only. The 'card' tone tokens in toneStyles.ts are
 * for larger summary tiles (e.g. the Diagnostics StatusCard) which have
 * their own title/value layout and consume `toneClassName(tone, 'card')`
 * directly rather than rendering through this component.
 */
export type StatusBadgeShape = 'pill' | 'outline';

export interface StatusBadgeProps {
  /** A `StatusInfo` from one of the domain mappers in src/lib/status. */
  status: StatusInfo;
  /** Visual style. 'pill' (rounded-full) or 'outline' (bordered rectangle, default). */
  variant?: StatusBadgeShape;
  /** Show the tone icon before the label. Default true. */
  showIcon?: boolean;
  /** Icon size in pixels. Default 12. */
  iconSize?: number;
  className?: string;
}

/**
 * Renders a `StatusInfo` consistently regardless of which domain produced
 * it. This is the single place that decides what "critical" looks like —
 * individual features should not define their own status color maps.
 *
 * @see docs/status-system.md
 */
export default function StatusBadge({
  status,
  variant = 'outline',
  showIcon = true,
  iconSize = 12,
  className = '',
}: StatusBadgeProps) {
  const Icon = TONE_ICON[status.tone];
  const toneClasses = toneClassName(status.tone, variant);
  const shapeClasses = variant === 'pill' ? 'rounded-full px-2.5 py-0.5' : 'rounded border px-2 py-1';

  return (
    <span
      title={status.detail}
      className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${shapeClasses} ${toneClasses} ${className}`}
    >
      {showIcon && <Icon size={iconSize} aria-hidden="true" />}
      {status.label}
    </span>
  );
}
