import { useState } from 'react';
import { ComplianceStatus, COMPLIANCE_CONFIG } from '@/types/compliance';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  showExplanation?: boolean;
}

export default function ComplianceBadge({ status, showExplanation }: ComplianceBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const config = COMPLIANCE_CONFIG[status];
  const Icon = config.icon;
  const showTooltip = hovered || showExplanation;

  return (
    <div className="relative inline-flex">
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${config.textColor} ${config.bgColor}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Icon size={14} />
        {config.label}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-10">
          {config.explanation}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
