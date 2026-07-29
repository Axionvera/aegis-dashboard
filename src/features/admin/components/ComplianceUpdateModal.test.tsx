import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ComplianceUpdateModal from "./ComplianceUpdateModal";
import { sampleSubjects } from "@/lib/__fixtures__/complianceReview";
import { COMPLIANCE_DISCLAIMER } from "@/lib/complianceReview";
import type { TransactionResult } from "@/components/transactions/types";

const subjects = sampleSubjects;

function renderModal(
  action: "approve" | "reject" | "flag-for-review" = "approve",
  overrides: Record<string, unknown> = {},
) {
  const onConfirm = vi.fn((): TransactionResult => ({
    status: "success" as const,
    message: "Compliance update applied",
    detail: "Approve applied to 4 subject(s).",
  }));
  const onClose = vi.fn();
  render(
    <ComplianceUpdateModal
      subjects={subjects}
      action={action}
      onConfirm={onConfirm}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { onConfirm, onClose };
}

describe("ComplianceUpdateModal — review phase", () => {
  it("renders the modal with review content", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Review compliance update")).toBeInTheDocument();
  });

  it("displays the action label in the review", () => {
    renderModal("reject");
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("shows the number of selected subjects", () => {
    renderModal();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("shows COMPLIANCE_DISCLAIMER in the review phase", () => {
    renderModal();
    expect(screen.getByText(COMPLIANCE_DISCLAIMER)).toBeInTheDocument();
  });

  it("renders Confirm & Sign and Cancel buttons", () => {
    renderModal();
    expect(
      screen.getByRole("button", { name: /confirm & sign/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the X button is clicked", () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ComplianceUpdateModal — confirm flow", () => {
  it("transitions to receipt on confirm", () => {
    const { onConfirm } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /confirm & sign/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Compliance update applied")).toBeInTheDocument();
  });

  it("shows the Close button on the receipt", () => {
    renderModal();
    fireEvent.click(screen.getByRole("button", { name: /confirm & sign/i }));

    expect(
      screen.getByRole("button", { name: /^close$/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when Close is clicked on receipt", () => {
    const { onClose } = renderModal();
    fireEvent.click(screen.getByRole("button", { name: /confirm & sign/i }));
    fireEvent.click(screen.getByRole("button", { name: /^close$/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ComplianceUpdateModal — subject rendering", () => {
  it("renders subject addresses for up to 5 subjects", () => {
    renderModal();
    for (const s of subjects) {
      const display = `${s.id.slice(0, 5)}...${s.id.slice(-4)}`;
      expect(screen.getByText(display)).toBeInTheDocument();
    }
  });

  it("does not show overflow text when 5 or fewer subjects", () => {
    renderModal();
    expect(screen.queryByText(/and.*more/)).not.toBeInTheDocument();
  });

  it("shows overflow count when more than 5 subjects", () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ ...subjects[0], id: `id-${i}` }));
    const { onConfirm, onClose } = renderModal("approve", {
      subjects: many,
    });
    expect(screen.getByText(/and 2 more/)).toBeInTheDocument();
  });
});

describe("ComplianceUpdateModal — edge cases", () => {
  it("handles empty subjects array gracefully", () => {
    const { onConfirm, onClose } = renderModal("approve", {
      subjects: [],
    });
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders for flag-for-review action", () => {
    renderModal("flag-for-review");
    expect(screen.getByText("Flag for Review")).toBeInTheDocument();
  });

  it("renders failure result on receipt", () => {
    const failOnConfirm = vi.fn((): TransactionResult => ({
      status: "failure" as const,
      message: "Compliance update failed",
      detail: "Insufficient permissions.",
    }));
    const onClose = vi.fn();
    render(
      <ComplianceUpdateModal
        subjects={subjects}
        action="approve"
        onConfirm={failOnConfirm}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /confirm & sign/i }));
    expect(screen.getByText("Compliance update failed")).toBeInTheDocument();
  });
});
