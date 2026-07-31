# SDK Error Recovery Actions

Issue: [#43](https://github.com/Axionvera/aegis-dashboard/issues/43)

Every dashboard flow that touches `@aegis/sdk` (today: the mock client in
`src/lib/aegis/client.ts`) can fail, and the *right next step* differs per
failure. Retrying a declined signature is harmless; retrying a submission whose
response was lost can move value twice. This module makes that distinction
explicit, typed, and testable, so no component has to re-derive it in a `catch`
block.

## Data Model

Three pure pieces, in `src/features/sdk-recovery/`:

| File | Responsibility |
| --- | --- |
| `types.ts` | `SdkErrorCategory`, `RecoveryAction`, `RecoveryPlan`, `RetryPolicy` |
| `classify.ts` | `classifySdkError(failure, context)` → `ClassifiedSdkError` |
| `recovery.ts` | `buildRecoveryPlan(error)` → `RecoveryPlan` |
| `retry.ts` | `computeBackoffDelay`, `shouldAutoRetry`, `runWithRecovery` |
| `components/SdkErrorRecovery.tsx` | Renders a plan; owns no policy |

### Categories

`wallet_unavailable`, `wallet_rejected`, `network_mismatch`,
`network_unreachable`, `timeout`, `rate_limited`, `compliance_blocked`,
`insufficient_funds`, `invalid_input`, `indeterminate`, `unknown`.

Categories are chosen by the recovery they imply, not by which layer raised
them: two RPC codes that both mean "wait and try again" share one category.

### Side-effect risk

Every classified error carries `sideEffectRisk`:

- `none` — the operation provably never reached the network (declined
  signature, malformed input, compliance refusal without a hash).
- `possible` — it may have been submitted (timeout, unreachable RPC, unknown).
- `confirmed` — it definitely reached the network (a hash plus an unreadable
  status).

This field, not the category, decides whether an automatic retry is allowed.

## Behaviour

`classifySdkError` accepts anything an SDK call can produce: a thrown `Error`, a
rejected value, an RPC envelope (`{ status, hash, error, errorMessage }`), a bare
status string, or `null`. Caller-supplied `context` (`walletConnected`,
`networkMatches`) wins over message sniffing, because it reflects live state
rather than a string the SDK happened to include.

`buildRecoveryPlan` returns the ordered actions a UI may offer, the retry policy
(or `null`), and `reuseIdempotencyKey` — telling callers that submit under the
[idempotency guard](form-idempotency.md) that a retry must carry the original
key so a possibly-live request cannot be applied twice. `SdkErrorRecovery` renders only the
actions the caller supplied a handler for, so a read-only screen never advertises
"Edit details".

`runWithRecovery` executes an operation under its own plan, retrying with
exponential backoff plus symmetric jitter. It resolves — never throws — with
either the value or the classified error and its plan.

```ts
const outcome = await runWithRecovery(() => client.getPortfolio(address), {
  context: { walletConnected: Boolean(address) },
});

if (!outcome.ok) render(<SdkErrorRecovery error={outcome.error} plan={outcome.plan} handlers={…} />);
```

## Edge Cases And Failure States

- **Hash present on a failure** — side-effect risk is never `none`, and
  `check_explorer` is injected into the plan even for categories that would not
  normally offer it.
- **Unknown failures** (`null`, an object with no message) are treated as
  possibly applied, not as safe-to-retry.
- **Auto-retry safety** — `shouldAutoRetry` returns `false` unless the category
  is retriable, attempts remain, *and* `sideEffectRisk === 'none'`. Plans whose
  risk is not `none` have `safeToAutomate` forced off for every action.
- **Backoff bounds** — delays are clamped to `maxDelayMs`, never negative, and
  attempt numbers below 1 are treated as the first attempt.
- **Detail redaction** — `redactDetail` strips URLs, truncates Stellar
  addresses, masks secret-shaped values, and caps length at 180 characters
  before any SDK text reaches the DOM.

## Security And Compliance Assumptions

- SDK/RPC error text is untrusted input. It is redacted and rendered as text —
  never as markup, and never used to derive authorisation decisions.
- `compliance_blocked` reports the protocol-level rules returned by the SDK.
  The attached note states plainly that this is **not legal or financial
  advice** and is not a statement about eligibility outside this protocol. It is
  never retried automatically, because retrying a deterministic refusal only
  produces the same refusal.
- The classifier is advisory. The authoritative outcome of any operation is what
  the contract and the explorer say, which is why `indeterminate` leads with
  "check the explorer" rather than a retry.
- Recovery actions never bypass a compliance check, mutate eligibility, or widen
  a user's permissions; they only re-run the same request or return the user to
  the form.

## Integration Points

- `src/features/investor/components/TransferModal.tsx` — classifies a failed
  transfer and renders the plan instead of a bare failure receipt; a retry
  reuses the original idempotency key whenever the request may have applied.
- `src/features/investor/hooks/usePortfolio.ts` — returns `failure` alongside
  `error`; `PortfolioErrorState` renders the plan when one is present.

## Tests And Fixtures

- Fixtures: `src/features/sdk-recovery/fixtures.ts` — one entry per category,
  using shapes Freighter, Soroban RPC and the mock client actually produce.
- `classify.test.ts` — category coverage, context precedence, side-effect risk,
  redaction.
- `recovery.test.ts` — plan shape, action ordering, and the invariant that no
  possibly-applied failure is ever auto-retried.
- `retry.test.ts` — backoff maths, jitter bounds, and executor behaviour with an
  injected clock.

## Trying It Locally

The mock client decides an outcome from the transfer amount, so every recovery
surface is reachable from `/portfolio` without editing code:

| Amount | Outcome | What you should see |
| --- | --- | --- |
| `0.01` | `FAILED` with a compliance message | "Blocked by compliance rules" plus the non-advisory note |
| `0.02` | `PENDING` | The normal pending receipt (no recovery surface) |
| `0.03` | Unrecognised status with a hash | "Outcome could not be confirmed", explorer link, no retry |
| anything else | `SUCCESS` | The normal success receipt |

## Current Limitations

- The mock client cannot yet produce most of these failures at runtime; the
  fixtures are the contract until the real SDK lands.
- `switch_network` cannot switch anything — Freighter owns the network
  selector — so the dashboard returns the user to the form with the mismatch
  explained.
- Backoff state is per-call. There is no shared circuit breaker across flows.

## Reviewer Checklist

Use alongside the general [Reviewer Checklist](reviewer-checklist.md) when a PR
adds or changes recovery behaviour.

- [ ] New failure shapes have a fixture in `fixtures.ts` with an expected category.
- [ ] A new category has a plan template, and its actions are reachable in at
      least one flow.
- [ ] No action added to a possibly-applied plan is marked `safeToAutomate`.
- [ ] Retry copy never promises that a retry is free of side effects.
- [ ] Compliance-shaped copy stays descriptive and carries no legal or financial
      advice.
- [ ] Raw SDK text reaching the UI passes through `redactDetail`.

## Related

- [Form Submission Idempotency Guard](form-idempotency.md)
- [Transaction History](transaction-history.md)
