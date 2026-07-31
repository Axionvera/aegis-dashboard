# End-to-End Mock Flow Fixtures

`src/fixtures/flows.ts` provides named, cross-feature "journeys" for local
development, tests, and manual QA in mock mode. Where the other files in
`src/fixtures/` each cover a single domain in isolation, `flows.ts` links
those existing fixtures together by investor address and asset, so a
contributor (or a test) can reason about *one investor's* experience across
the whole app rather than assembling that picture by hand from five
unrelated files.

This is **not** a new source of mock data. Every value referenced by a flow
scenario already exists in `compliance.ts`, `issuer.ts`,
`src/features/minting/fixtures.ts`, `portfolio.ts`, or `transactions.ts`.
`flows.ts` only assembles references to that data — if you need to change
what a scenario looks like, edit the underlying fixture file, not `flows.ts`.

---

## Why this exists

Mock mode (see [mock-mode.md](mock-mode.md)) already lets you run any single
page against fixture data. But the individual fixture files don't agree with
one another by design — `compliance.ts`'s five subjects, `portfolio.ts`'s
four assets, and `transactions.ts`'s six records aren't guaranteed to
describe the same investor or the same asset. That's fine for exercising one
component in isolation, but it makes it hard to answer questions like:

> "What does the *entire* app look like for an investor whose compliance
> status is 'restricted'?"

`flows.ts` answers that by picking out one investor, one asset, and one
outcome, and pulling the matching entry from every relevant fixture file.

---

## Available scenarios

| Scenario id | Outcome | What it demonstrates |
|---|---|---|
| `compliant-investor-journey` | `compliant` | Approved compliance, minted asset, eligible/compliant portfolio holding, successful transfer history. |
| `restricted-investor-journey` | `restricted` | Accreditation flagged for renewal, issuer-paused asset, ineligible/restricted portfolio holding, a failed transfer in history. |
| `pending-review-investor-journey` | `pending_review` | Sanctions screen still in flight, pending issuance request, portfolio holding with unavailable data, an in-flight admin action. |

Each scenario has this shape:

```ts
interface MockFlowScenario {
  id: string;
  title: string;
  description: string;
  outcome: 'compliant' | 'restricted' | 'pending_review';
  investorAddress: string;
  stages: {
    compliance: ComplianceSubject;
    assetIssuance: IssuanceRequest;
    mintableAsset: MintableAsset;
    portfolio: PortfolioAsset;
    transactions: NormalizedTransaction[];
    diagnostics: typeof mockDiagnosticsFixture;
  };
}
```

## Usage

```ts
import { mockFlowScenarios, findFlowScenario } from '@/fixtures/flows';
// or: import { mockFlowScenarios } from '@/fixtures';

// Iterate every scenario, e.g. for a parameterised test or a story list:
for (const scenario of mockFlowScenarios) {
  // scenario.stages.compliance, .portfolio, .transactions, etc.
}

// Look up one scenario by id:
const restricted = findFlowScenario('restricted-investor-journey');
```

See `src/__tests__/fixtures/flows.test.ts` for referential-integrity tests
that confirm every scenario resolves to real entries in the underlying
fixture files, and that all three reviewable outcomes are represented.

---

## Adding a new scenario

1. Make sure the investor address, asset id, and ticker you want already
   exist (or add them) in the relevant per-domain fixture file
   (`compliance.ts`, `issuer.ts`, `minting/fixtures.ts`, `portfolio.ts`,
   `transactions.ts`).
2. Add a new `MockFlowScenario` object in `flows.ts` that references those
   entries via the `require*`/`transactionsFor` helpers already in the file
   — don't inline new literal data into `flows.ts` itself.
3. Push it into the `mockFlowScenarios` array.
4. Add or extend a test case in `flows.test.ts` covering the new scenario.

---

## Related

- [mock-mode.md](mock-mode.md) — how the mock SDK provider itself is wired up
- `src/fixtures/flows.ts` — implementation
- `src/__tests__/fixtures/flows.test.ts` — referential-integrity tests