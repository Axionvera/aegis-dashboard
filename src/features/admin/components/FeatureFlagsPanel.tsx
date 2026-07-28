import {
  useFeatureFlags,
  FLAG_METADATA,
  type FeatureFlagKey,
} from '@/hooks/useFeatureFlags';

const FLAG_KEYS = Object.keys(FLAG_METADATA) as FeatureFlagKey[];

export default function FeatureFlagsPanel() {
  const { flags, toggleFlag } = useFeatureFlags();

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-bold text-aegis-dark mb-1">
        Feature Flags
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Toggle experimental features for this session. Changes are local to
        your browser and do not affect on-chain or compliance state.
      </p>

      <ul className="divide-y divide-slate-100">
        {FLAG_KEYS.map((key) => {
          const meta = FLAG_METADATA[key];
          const enabled = flags[key];

          return (
            <li
              key={key}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="pr-0 sm:pr-4">
                <p className="text-sm font-medium text-aegis-dark">
                  {meta.label}
                </p>
                <p className="text-xs text-slate-500">{meta.description}</p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={`Toggle ${meta.label}`}
                onClick={() => toggleFlag(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-aegis-accent focus:ring-offset-2 ${
                  enabled ? 'bg-aegis-brand' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}