import type { AssetLifecycleState } from '@/lib/assetLifecycle';
import { LIFECYCLE_STATE_INFO, type LifecycleTone } from '@/lib/assetLifecycle';

const TONE_STYLES: Record<LifecycleTone, string> = {
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  caution: 'bg-amber-50 text-amber-700 border-amber-200',
  negative: 'bg-red-50 text-red-700 border-red-200',
};

interface AssetLifecycleBadgeProps {
  state: AssetLifecycleState;
}

export default function AssetLifecycleBadge({ state }: AssetLifecycleBadgeProps) {
  const info = LIFECYCLE_STATE_INFO[state];

  return (
    <span
      title={info.detail}
      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded border whitespace-nowrap ${TONE_STYLES[info.tone]}`}
    >
      {info.label}
    </span>
  );
}
