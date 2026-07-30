/**
 * src/lib/status/toneStyles.ts
 *
 * Single source of truth for status colours. (Issue #182)
 *
 * Before this module, each status-rendering component (ComplianceBadge,
 * AssetLifecycleBadge, StatusCard, the Issuer Console status pill, the
 * whitelist badge, ...) defined its own `Record<SomeState, string>` of
 * Tailwind classes. That meant "critical" could be red in one place and
 * rose in another purely by accident. Every tone now has exactly one style
 * per variant, defined here.
 *
 * Variants:
 *  - `pill`    — rounded-full badge (matches the Issuer Console / whitelist
 *                style already in use)
 *  - `outline` — bordered rectangular badge (matches the existing
 *                ComplianceBadge / AssetLifecycleBadge style)
 *  - `card`    — larger bordered block (matches the Diagnostics StatusCard
 *                style)
 */

import type { StatusTone } from './types';

export type StatusBadgeVariant = 'pill' | 'outline' | 'card';

export const TONE_PILL_STYLES: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
  caution: 'bg-amber-100 text-amber-800',
  critical: 'bg-rose-100 text-rose-800',
  unknown: 'bg-slate-100 text-slate-500',
};

export const TONE_OUTLINE_STYLES: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  caution: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  unknown: 'bg-slate-50 text-slate-500 border-slate-200',
};

export const TONE_CARD_STYLES: Record<StatusTone, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  caution: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  unknown: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const VARIANT_STYLES: Record<StatusBadgeVariant, Record<StatusTone, string>> = {
  pill: TONE_PILL_STYLES,
  outline: TONE_OUTLINE_STYLES,
  card: TONE_CARD_STYLES,
};

/** Look up the class string for a tone + variant. */
export function toneClassName(tone: StatusTone, variant: StatusBadgeVariant = 'outline'): string {
  return VARIANT_STYLES[variant][tone];
}
