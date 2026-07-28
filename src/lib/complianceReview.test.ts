import { describe, it, expect } from "vitest";
import {
  deriveStatus,
  DEFAULT_REVIEW_RULE,
  severityRank,
  filterSubjects,
  tallyByStatus,
  recomputeSelection,
  toggleSelection,
  setSelectionAll,
  applyBulkAction,
  type ComplianceCheck,
  type ComplianceSubject,
  type ComplianceReviewState,
} from "@/lib/complianceReview";
import { sampleSubjects } from "@/lib/__fixtures__/complianceReview";

const checks = (results: ComplianceCheck["result"][]): ComplianceCheck[] =>
  results.map((r, i) => ({ key: `c${i}`, label: `Check ${i}`, result: r }));

describe("deriveStatus", () => {
  it("approves when all checks pass", () => {
    expect(deriveStatus(checks(["pass", "pass"]))).toBe("approved");
  });

  it("rejects when any check fails", () => {
    expect(deriveStatus(checks(["pass", "fail", "pass"]))).toBe("rejected");
  });

  it("flags for review when any check warns (and none fail)", () => {
    expect(deriveStatus(checks(["pass", "warn"]))).toBe("review");
  });

  it("stays pending when any check is unknown", () => {
    expect(deriveStatus(checks(["pass", "unknown"]))).toBe("pending");
  });

  it("defaults to pending with no checks", () => {
    expect(deriveStatus([])).toBe("pending");
  });

  it("honours a custom rule", () => {
    const rule = { ...DEFAULT_REVIEW_RULE, onAnyWarn: "approved" as const };
    expect(deriveStatus(checks(["pass", "warn"]), rule)).toBe("approved");
  });
});

describe("severityRank", () => {
  it("orders low < medium < high < critical", () => {
    expect(severityRank("low")).toBeLessThan(severityRank("medium"));
    expect(severityRank("medium")).toBeLessThan(severityRank("high"));
    expect(severityRank("high")).toBeLessThan(severityRank("critical"));
  });
});

describe("filterSubjects", () => {
  it("returns all when query is empty", () => {
    expect(filterSubjects(sampleSubjects, "  ")).toBe(sampleSubjects);
  });

  it("matches by id substring (case-insensitive)", () => {
    const id = sampleSubjects[1].id;
    const q = id.slice(0, 12).toLowerCase();
    const out = filterSubjects(sampleSubjects, q);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe(id);
  });

  it("matches by meta value", () => {
    const out = filterSubjects(sampleSubjects, "EU");
    expect(out).toHaveLength(1);
    expect(out[0].meta?.jurisdiction).toBe("EU");
  });

  it("returns empty when nothing matches", () => {
    expect(filterSubjects(sampleSubjects, "zzzz-no-match")).toHaveLength(0);
  });
});

describe("tallyByStatus", () => {
  it("counts subjects per status", () => {
    const tally = tallyByStatus(sampleSubjects);
    expect(tally.pending).toBe(1);
    expect(tally.approved).toBe(1);
    expect(tally.review).toBe(1);
    expect(tally.rejected).toBe(1);
  });
});

describe("selection helpers", () => {
  const base = (): ComplianceReviewState =>
    recomputeSelection(sampleSubjects.map((s) => ({ ...s })));

  it("toggleSelection flips one row and recomputes counts", () => {
    const s0 = base();
    expect(s0.selectedCount).toBe(0);
    const id = s0.subjects[0].id;
    const s1 = toggleSelection(s0, id);
    expect(s1.selectedCount).toBe(1);
    expect(s1.subjects[0].selected).toBe(true);
    const s2 = toggleSelection(s1, id);
    expect(s2.selectedCount).toBe(0);
  });

  it("setSelectionAll selects/deselects everything", () => {
    const s0 = base();
    const all = setSelectionAll(s0, true);
    expect(all.selectedCount).toBe(all.subjects.length);
    expect(all.allSelected).toBe(true);
    const none = setSelectionAll(all, false);
    expect(none.selectedCount).toBe(0);
    expect(none.allSelected).toBe(false);
  });
});

describe("applyBulkAction", () => {
  const selectFirstTwo = (): ComplianceReviewState => {
    let s = recomputeSelection(sampleSubjects.map((x) => ({ ...x })));
    s = toggleSelection(s, s.subjects[0].id);
    s = toggleSelection(s, s.subjects[1].id);
    return s;
  };

  it("approves selected rows and clears selection", () => {
    const s = selectFirstTwo();
    const next = applyBulkAction(s, "approve");
    expect(next.selectedCount).toBe(0);
    expect(next.subjects[0].status).toBe("approved");
    expect(next.subjects[1].status).toBe("approved");
    // Unselected rows untouched
    expect(next.subjects[2].status).toBe("review");
  });

  it("rejects selected rows", () => {
    const s = selectFirstTwo();
    const next = applyBulkAction(s, "reject");
    expect(next.subjects[0].status).toBe("rejected");
    expect(next.subjects[1].status).toBe("rejected");
  });

  it("flags selected rows for review", () => {
    const s = selectFirstTwo();
    const next = applyBulkAction(s, "flag-for-review");
    expect(next.subjects[0].status).toBe("review");
  });

  it("clear only removes selection, not status", () => {
    const s = selectFirstTwo();
    const next = applyBulkAction(s, "clear");
    expect(next.selectedCount).toBe(0);
    expect(next.subjects[0].status).toBe("pending");
    expect(next.subjects[1].status).toBe("approved");
  });

  it("no-op when nothing selected", () => {
    const s = recomputeSelection(sampleSubjects.map((x) => ({ ...x })));
    const next = applyBulkAction(s, "approve");
    expect(next).toBe(s);
  });

  it("respects explicit selectedIds", () => {
    const s = recomputeSelection(sampleSubjects.map((x) => ({ ...x })));
    const id = s.subjects[3].id;
    const next = applyBulkAction(s, "approve", [id]);
    expect(next.subjects[3].status).toBe("approved");
    expect(next.selectedCount).toBe(0);
  });
});

describe("fixtures sanity", () => {
  it("sample subjects have consistent derived statuses", () => {
    for (const s of sampleSubjects as ComplianceSubject[]) {
      const derived = deriveStatus(s.checks);
      // derived status should be a valid ComplianceStatus
      expect(["pending", "approved", "rejected", "review"]).toContain(derived);
    }
  });
});
