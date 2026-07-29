import { useState } from "react";
import { X } from "lucide-react";
import TransactionReceipt from "@/components/transactions/TransactionReceipt";
import TransactionReview from "@/components/transactions/TransactionReview";
import { COMPLIANCE_DISCLAIMER, withDisclaimer } from "@/lib/complianceReview";
import { truncateAddress } from "@/utils/formatting";
import type { ComplianceSubject, BulkAction } from "@/lib/complianceReview";
import type {
  TransactionDetails,
  TransactionResult,
} from "@/components/transactions/types";

export const ACTION_LABELS: Record<BulkAction, string> = {
  approve: "Approve",
  reject: "Reject",
  "flag-for-review": "Flag for Review",
  clear: "Clear selection",
};

export interface ComplianceUpdateModalProps {
  subjects: ComplianceSubject[];
  action: BulkAction;
  network?: string;
  onConfirm: () => TransactionResult;
  onClose: () => void;
}

type Phase = "review" | "receipt";

export default function ComplianceUpdateModal({
  subjects,
  action,
  network,
  onConfirm,
  onClose,
}: ComplianceUpdateModalProps) {
  const [phase, setPhase] = useState<Phase>("review");
  const [result, setResult] = useState<TransactionResult | null>(null);

  const actionLabel = ACTION_LABELS[action];

  const details: TransactionDetails = {
    action: "compliance-update",
    title: "Review compliance update",
    description: withDisclaimer(
      `Review ${actionLabel.toLowerCase()} action for ${subjects.length} subject(s).`,
    ),
    network,
    rows: [
      { label: "Action", value: actionLabel },
      { label: "Selected subjects", value: String(subjects.length) },
      ...subjects.slice(0, 5).map((s, i) => ({
        label: `Subject ${i + 1}`,
        value: truncateAddress(s.id),
        mono: true,
      })),
      ...(subjects.length > 5
        ? [{ label: "", value: `\u2026 and ${subjects.length - 5} more` }]
        : []),
    ],
  };

  const handleConfirm = () => {
    const txResult = onConfirm();
    setResult(txResult);
    setPhase("receipt");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative mt-12 w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Compliance update review"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {phase === "review" && (
            <>
              <TransactionReview
                details={details}
                onConfirm={handleConfirm}
                onCancel={onClose}
              />
              <p className="mt-4 text-xs text-slate-400 text-center">
                {COMPLIANCE_DISCLAIMER}
              </p>
            </>
          )}

          {phase === "receipt" && result && (
            <TransactionReceipt
              result={result}
              details={details}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
