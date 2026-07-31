import React from 'react';
import {
  evaluateOnboardingEligibility,
  type OnboardingEligibilityInput,
  type OnboardingEligibilityResult,
  type EligibilityState,
} from '@/lib/eligibility';
import { COMPLIANCE_DISCLAIMER } from '@/lib/complianceReview';

const BADGE_STYLES: Record<EligibilityState, string> = {
  compliant: 'bg-green-50 text-green-700 border-green-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  unknown: 'bg-amber-50 text-amber-700 border-amber-200',
  unavailable: 'bg-slate-100 text-slate-600 border-slate-200',
};

const DOT_STYLES: Record<EligibilityState, string> = {
  compliant: 'bg-green-500',
  blocked: 'bg-red-500',
  unknown: 'bg-amber-500',
  unavailable: 'bg-slate-400',
};

function Badge({ state, children }: { state: EligibilityState; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${BADGE_STYLES[state]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[state]}`} />
      {children}
    </span>
  );
}

export interface OnboardingEligibilityPanelProps {
  input: OnboardingEligibilityInput;
}

export default function OnboardingEligibilityPanel({ input }: OnboardingEligibilityPanelProps) {
  const result: OnboardingEligibilityResult = evaluateOnboardingEligibility(input);

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label="Onboarding eligibility"
    >
      <header className="mb-3">
        <h3 className="text-base font-bold text-slate-800">Onboarding eligibility</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Informational only. Final approval is decided on-chain.
        </p>
      </header>

      <div className="flex items-start justify-between gap-3 py-3 border-b border-slate-100">
        <div className="min-w-0">
          <div className="text-sm text-slate-600 mt-0.5">{result.message}</div>
          {result.hint && <div className="text-xs text-slate-400 mt-1">{result.hint}</div>}
        </div>
        <Badge state={result.state}>{result.title}</Badge>
      </div>

      <p className="text-xs text-slate-400 mt-3">{COMPLIANCE_DISCLAIMER}</p>
    </section>
  );
}
