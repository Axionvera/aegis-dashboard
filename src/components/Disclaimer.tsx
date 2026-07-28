import { Info, ScrollText } from 'lucide-react';

export type DisclaimerVariant = 'footer' | 'page' | 'modal' | 'card';

export interface DisclaimerProps {
  /**
   * Determines where the disclaimer is rendered and adjusts weight/visual style.
   * - `footer`: muted, single-line legal notice for app-wide footer
   * - `page`:   boxed informational notice for top of legal-sensitive pages
   * - `modal`:  compact inline notice embedded inside dialogs/modals
   * - `card`:   microcopy shown alongside an asset/token surface
   */
  variant: DisclaimerVariant;
  text: string;
  className?: string;
}

const variantStyles: Record<DisclaimerVariant, string> = {
  footer:
    'text-[11px] leading-relaxed border-t border-slate-200 pt-4 mt-8 text-slate-500',
  page:
    'text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 mt-6',
  modal:
    'text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-md p-3',
  card:
    'text-[10px] text-slate-400 italic',
};

/**
 * Renders a non-promissory protocol disclaimer.
 *
 * IMPORTANT: copy used here must never imply that on-chain protocol behavior
 * (allowlists, transfers, minting) is equivalent to legal, regulatory, or
 * financial compliance in any jurisdiction. See `docs/compliance-disclaimers.md`.
 */
export default function Disclaimer({ variant, text, className = '' }: DisclaimerProps) {
  const Icon = variant === 'card' || variant === 'modal' ? Info : ScrollText;

  return (
    <div
      role="note"
      className={`flex items-start space-x-2 ${variantStyles[variant]} ${className}`}
    >
      <Icon
        className={`shrink-0 ${
          variant === 'card' ? 'w-3 h-3 mt-[1px] text-slate-400' : 'w-4 h-4 mt-[2px] text-amber-600'
        }`}
        aria-hidden="true"
      />
      <p className={variant === 'footer' ? '' : 'leading-relaxed'}>{text}</p>
    </div>
  );
}
