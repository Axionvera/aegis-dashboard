# PR Reviewer Evidence Checklist

> **Version:** 1.0
> **Last Updated:** 2026-07-28
> **Applies To:** Maintainers and reviewers reviewing pull requests on the Aegis Dashboard

## Purpose

This checklist gives maintainers a structured reference for verifying that every pull request contains complete, concrete, and verifiable evidence. It complements the broader [Reviewer Quality Checklist](reviewer-checklist.md) by focusing exclusively on the evidence section of the PR description — before reviewing code quality, testing, security, or styling.

Using this checklist ensures:

- **Consistent evaluations** — Every PR is judged against the same evidence criteria.
- **Faster reviews** — Reviewers know exactly what to look for and can quickly identify gaps.
- **Clearer feedback** — Insufficient evidence is flagged with specific, actionable comments.
- **GrantFox readiness** — PRs that pass this evidence check are already structured for payment evaluation.

---

## How to Use This Checklist

1. Open the pull request and read the description.
2. Open the linked issue and review its acceptance criteria.
3. Work through each section below in order.
4. Mark each item as **Pass**, **Fail**, or **N/A**.
5. If any item fails, leave a clear, constructive comment explaining what evidence is missing or insufficient.
6. If all evidence checks pass, proceed to the [Reviewer Quality Checklist](reviewer-checklist.md) for the full review.

> **Tip:** Copy the [Quick-Reference Checklist](#quick-reference-checklist) into your review comment for easy tracking.

---

## 1. Issue Reference

The PR must link to a tracked issue using a GitHub closing keyword.

| # | Check | Details |
|---|-------|---------|
| 1.1 | **Issue linked** | PR references an open issue using `Closes #N`, `Fixes #N`, or `Resolves #N`. |
| 1.2 | **Scope matches** | The PR's changes stay within the scope defined by the linked issue. Out-of-scope additions require a separate issue. |
| 1.3 | **Issue has acceptance criteria** | The linked issue includes clear, testable acceptance criteria. If it does not, flag this to the contributor before proceeding. |

**Insufficient evidence examples:**
- Issue mentioned in prose without a closing keyword ("related to #42" without `Closes #42`)
- No issue reference at all

---

## 2. Implementation Summary

The PR description must explain what changed, why, and which files were affected.

| # | Check | Details |
|---|-------|---------|
| 2.1 | **What and why** | The summary clearly states what was changed and the reasoning behind it. |
| 2.2 | **Files listed** | The key files added, modified, or removed are listed with paths. |
| 2.3 | **Matches the diff** | A quick scan of the diff confirms the summary accurately reflects the actual changes. |

**Insufficient evidence examples:**
- Vague summary ("Fixed stuff", "Updated code")
- No file list or a file list that does not match the diff
- Default template text left in place

---

## 3. Testing

The PR must include evidence that changes are tested, or a valid justification for why tests are not applicable.

| # | Check | Details |
|---|-------|---------|
| 3.1 | **Tests added or justification given** | Either tests are included with file names and coverage descriptions, or a clear justification explains why tests are not applicable. See the [PR Evidence Checklist](pr-evidence-checklist.md#3-testing) for acceptable justifications. |
| 3.2 | **Coverage meets standards** | If the change touches admin workflows, investor views, compliance screens, asset registration, minting, wallet connection, or diagnostics, verify the PR meets the [Minimum Testing Standard](testing-standard.md). For SDK-adjacent areas, verify the [SDK Testing Standard](sdk-testing-standard.md). |
| 3.3 | **Test output attached** | The PR includes `npm test` output (summary or screenshot) demonstrating clean execution. |
| 3.4 | **Existing tests still pass** | The contributor confirms all existing tests pass locally. |

**Insufficient evidence examples:**
- "Tests not applicable" without justification
- "Will add tests later"
- Test output missing or shows failures
- Copying test file names without describing what they cover

---

## 4. Commands Run

The PR must list the exact commands the contributor executed locally to validate the change.

| # | Check | Details |
|---|-------|---------|
| 4.1 | **Minimum commands listed** | At minimum, `npm run lint`, `npm run build`, and `npm run dev` (or applicable equivalents) are listed. If tests were added, `npm test` is listed. |
| 4.2 | **Output provided** | Command output or screenshots are included where results are not obvious (e.g., passing test summary, successful build log). |
| 4.3 | **Results match expectations** | The output confirms all commands completed successfully. |

**Insufficient evidence examples:**
- Commands listed without any output or confirmation of success
- Only a subset of required commands shown
- Placeholder text left in the template

---

## 5. CI Status

The PR must confirm that all automated checks pass.

| # | Check | Details |
|---|-------|---------|
| 5.1 | **CI checks green** | All GitHub Actions checks triggered by the PR are passing. |
| 5.2 | **Failures explained** | If a CI check fails for a reason unrelated to the changes (e.g., infrastructure flake), the contributor has documented it in the **Reviewer Notes** section with a link to the failing job. |
| 5.3 | **No new warnings** | The contributor confirms no new warnings or errors were introduced. |

**Insufficient evidence examples:**
- CI checks still running or failing without explanation
- "CI passes" claimed but checks are red
- No mention of CI status at all

---

## 6. Acceptance Criteria Coverage

The PR must explicitly map every acceptance criterion from the linked issue to concrete evidence.

| # | Check | Details |
|---|-------|---------|
| 6.1 | **All criteria listed** | Every acceptance criterion from the linked issue appears in the mapping table. |
| 6.2 | **Evidence is specific** | Each criterion is mapped to a specific file path, test name, screenshot, or other verifiable reference — not a generic claim. |
| 6.3 | **No silent skips** | No criterion is left unchecked without a justification. See the [Acceptance Criteria Audit](acceptance-criteria-audit.md) for detailed guidance. |

**Insufficient evidence examples:**
- Mapping table lists only a subset of criteria
- Evidence is vague ("Done", "Implemented", "Added code")
- Criteria are checked off with no evidence column

---

## 7. Self-Assessment

The PR must include a completed [Contributor Self-Assessment Form](self-assessment-checklist.md).

| # | Check | Details |
|---|-------|---------|
| 7.1 | **Form attached** | The completed self-assessment form is attached to the PR (pasted in the **Reviewer Notes** section or attached as a file comment). |
| 7.2 | **Form is complete** | All fields are filled in (contributor name, date, issue number, branch name) and all checklist items are marked. |
| 7.3 | **Declaration signed** | The declaration section is completed. |

**Insufficient evidence examples:**
- Form not attached or referenced
- Form attached but partially filled
- Only the PR template checkbox is ticked without the actual form

---

## Quick-Reference Checklist

Copy this into your PR review comment for convenient tracking:

```markdown
### PR Evidence Review

**Issue Reference**
- [ ] Issue is linked with closing keyword
- [ ] Scope matches the linked issue
- [ ] Issue has clear acceptance criteria

**Implementation Summary**
- [ ] What and why are clearly stated
- [ ] Files changed are listed
- [ ] Summary matches the diff

**Testing**
- [ ] Tests added or valid justification provided
- [ ] Coverage meets applicable standards
- [ ] Test output included
- [ ] Existing tests still pass

**Commands Run**
- [ ] Minimum commands listed
- [ ] Output or screenshots provided
- [ ] Results confirm success

**CI Status**
- [ ] CI checks are green
- [ ] Failures are explained (if any)
- [ ] No new warnings introduced

**Acceptance Criteria Coverage**
- [ ] All criteria from the issue are listed
- [ ] Evidence is specific and verifiable
- [ ] No criteria skipped without justification

**Self-Assessment**
- [ ] Self-assessment form is attached
- [ ] Form is fully completed
- [ ] Declaration is signed
```

---

## Handling Insufficient Evidence

When evidence is missing or insufficient:

1. **Leave a specific comment** — Quote the missing item and explain what is needed. Point to the relevant section of the [PR Evidence Checklist](pr-evidence-checklist.md) as a reference.
2. **Request changes** — Apply the **Request Changes** review status. Do not approve a PR with incomplete evidence.
3. **Follow up** — If the contributor updates the PR, re-check only the flagged items before proceeding to the full [Reviewer Quality Checklist](reviewer-checklist.md).

PRs that repeatedly fail the evidence check may be flagged for process non-compliance.

---

## Related Documentation

- [PR Evidence Checklist](pr-evidence-checklist.md) — Detailed evidence requirements for contributors (what this checklist verifies)
- [Reviewer Quality Checklist](reviewer-checklist.md) — Full review process covering code quality, testing, security, and styling
- [Self-Assessment Form](self-assessment-checklist.md) — Pre-submit form contributors must complete
- [Acceptance Criteria Audit](acceptance-criteria-audit.md) — How to audit criteria-to-evidence mappings
- [Contributing Guide](../CONTRIBUTING.md) — Branch naming, component rules, and review workflow
- [PR Template](../.github/pull_request_template.md) — Auto-loaded when opening a new PR
