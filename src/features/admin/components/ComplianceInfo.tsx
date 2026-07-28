import { ComplianceStatus, COMPLIANCE_CONFIG } from '@/types/compliance';
import ComplianceBadge from '@/features/assets/components/ComplianceBadge';

const ALL_STATUSES: ComplianceStatus[] = [
  'approved',
  'not-approved',
  'pending',
  'blocked',
  'unknown',
  'unavailable',
];

export default function ComplianceInfo() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6">Compliance Status Reference</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_STATUSES.map(status => {
          const config = COMPLIANCE_CONFIG[status];
          const Icon = config.icon;
          return (
            <div
              key={status}
              className={`p-4 rounded-lg border ${config.bgColor} border-slate-100`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={config.textColor} />
                <span className={`text-sm font-semibold ${config.textColor}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {config.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
