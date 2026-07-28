# Form Submission Idempotency Guard

Issue: [#39](https://github.com/Axionvera/aegis-dashboard/issues/39)

The dashboard signs value-moving operations: transfers, mints, compliance
updates. A double-click on **Confirm**, an impatient retry, or a component
remount must not turn one user intent into two submissions. The guard gives every
submission a key derived from *what is being submitted* and refuses a second
submission under the same key while the first is unresolved.

## Data Model

In `src/features/forms/idempotency/`:

| File | Responsibility |
| --- | --- |
| `types.ts` | `SubmissionState`, `GuardDecision`, `GuardVerdict`, `SubmissionEntry` |
| `key.ts` | `stableStringify`, `hashString`, `createIdempotencyKey` |
| `ledger.ts` | `IdempotencyLedger` + the shared `submissionLedger` |
| `useIdempotentSubmit.ts` | React binding used by forms |
| `fixtures.ts` | Payloads that must and must not collide |

### Keys

```
transfer:GABCABCD:1f3a9c02
└ scope   └ actor  └ FNV-1a hash of the canonical payload
```

The payload is canonicalised before hashing: object keys sorted, `undefined`
fields dropped, arrays order-sensitive, dates reduced to their instant, cycles
rejected. Two renders of the same intent therefore produce one key, while editing
any field produces a new one.

The scope and actor stay readable so a key is useful in a support thread; the
payload is hashed so amounts and addresses are not duplicated in the clear
wherever the key is logged.

### Verdicts

`begin(key)` returns exactly one decision:

| Decision | Allowed | Meaning |
| --- | --- | --- |
| `proceed` | ✅ | No conflicting entry. |
| `retry_after_failure` | ✅ | The previous attempt failed; it did not apply. |
| `proceed_after_stale` | ✅ | An in-flight entry outlived its TTL and is presumed abandoned. |
| `duplicate_in_flight` | ⛔ | An identical submission is still running. |
| `replay_result` | ⛔ | An identical submission already succeeded inside the replay window. |

## Behaviour

```tsx
const submission = useIdempotentSubmit<RawTransactionOutcome>({
  scope: 'transfer',
  actor: address,
  payload: { assetId, recipient, amount, network },
});

const outcome = await submission.submit((key) => transfer(recipient, amount));
```

`submit` returns `{ status: 'submitted' | 'blocked' | 'failed' }`. A blocked
`replay_result` carries the original result so the caller shows the first
receipt instead of signing a second, indistinguishable transaction. A blocked
`duplicate_in_flight` keeps the progress view on screen.

The key is passed into the operation so it can be forwarded to the SDK once the
protocol accepts one — at that point the de-duplication survives a lost response
instead of living only in this tab.

## Edge Cases And Failure States

- **Double-click / burst** — only the first of N concurrent submits is allowed.
- **Slow success then re-submit** — replayed for `DEFAULT_SUCCESS_TTL_MS`
  (5 minutes) rather than re-run.
- **Failure** — releases the key immediately; a retry is a legitimate new
  attempt and is counted in `entry.attempts`.
- **Abandoned in-flight entry** — released after `DEFAULT_IN_FLIGHT_TTL_MS`
  (60 seconds) with the distinguishable `proceed_after_stale` decision, so the
  user is never permanently locked out of their own form.
- **Unmount mid-flight** — the claim is deliberately *not* released. Closing a
  modal does not cancel a request that already left the client; freeing the key
  there would let the next render submit a duplicate. Callers that know a
  submission never left the client can call `abandon()` explicitly.
- **Payload edited** — a new key, so the guard never blocks a genuinely
  different submission.
- **Different signer or different operation, identical values** — different
  keys; wallets and scopes never share an entry.
- **Non-finite numbers, circular payloads** — normalised rather than thrown.

## Security And Compliance Assumptions

- **This is a client-side guard.** It removes duplicates originating in this
  browser tab. It is not a substitute for server- or contract-side
  de-duplication, which remains the authoritative protection against replay. Two
  tabs, two devices, or a page reload can still produce two submissions.
- The ledger is **not persisted**. After a reload we can no longer prove what is
  in flight, and a stale "already submitted" claim across sessions would be worse
  than asking the user to check the explorer.
- Keys are **not secrets** and must not be treated as capabilities. `hashString`
  is FNV-1a — chosen for short, log-safe keys, not for collision resistance. A
  collision would surface as a wrongly-blocked submission, never as a wrongly
  *authorised* one, because the guard can only ever deny.
- The guard makes no compliance determination. It runs after the eligibility and
  whitelist checks and only decides whether *this same request* may be sent
  again.

## Interaction With Error Recovery

Because the key is derived from the unchanged payload, any retry offered after a
failure naturally resolves to the same key — so a retry following a lost
response cannot become a second transfer. The SDK error recovery work in issue
#43 surfaces this explicitly through a `reuseIdempotencyKey` flag on its
recovery plans.

## Integration Points

- `src/features/investor/components/TransferModal.tsx` — keyed on
  `(signer, asset, recipient, amount, network)`; the review screen's
  **Confirm & Sign** button is disabled while a submission is in flight.

## Tests And Fixtures

- Fixtures: `src/features/forms/idempotency/fixtures.ts` — identical intents in
  different shapes, plus near-identical intents that must not collide.
- `key.test.ts` — canonicalisation, determinism, and separation rules.
- `ledger.test.ts` — every verdict, TTL expiry, pruning, and lifecycle helpers,
  driven by an injected clock.
- `useIdempotentSubmit.test.tsx` — concurrent submits, replay, retry after
  failure, payload edits, unmount safety.

## Current Limitations

- In-memory and per-tab, as described above.
- The mock SDK client accepts no idempotency parameter yet, so the key is
  currently generated and enforced client-side only.
- TTLs are constants; they are not yet configurable per operation.

## Reviewer Checklist

Use alongside the general [Reviewer Checklist](reviewer-checklist.md) when a PR
adds a guarded form or changes the guard.

- [ ] The payload includes every field that makes the submission distinct
      (signer, asset, recipient, amount, network) and nothing volatile such as a
      timestamp or a random id.
- [ ] The submit button is disabled while `submission.isSubmitting` is true.
- [ ] A blocked `replay_result` shows the original outcome rather than an error.
- [ ] No code path calls `abandon()` for a request that may already have left
      the client.
- [ ] The flow does not rely on the guard for correctness where a contract-level
      check is required.
- [ ] Tests cover the double-submit and the edit-then-resubmit paths.

## Related

- [Transaction History](transaction-history.md)
- Issue #43 (SDK error recovery actions) builds the retry surface that reuses
  these keys.
