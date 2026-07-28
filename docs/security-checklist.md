# Frontend Security Review Checklist

This checklist must be applied to **every** frontend PR that touches wallet, signer,
secret handling, diagnostics, transaction review, wrong-network handling, admin,
compliance, or minting flows. PRs are not mergeable until every box is justified
— either ticked off, or explicitly marked as **N/A** with a short reason.

> **Audience:** PR reviewers and contributors working on `src/`.
> **Scope:** UI, hooks, and Next.js page-level code under `src/`. Smart-contract
> security lives in the `@aegis/sdk` repo; this document only covers what the
> dashboard is responsible for.

---

## How to Use This Checklist

1. Open the PR diff and walk through every file under the changed paths.
2. Tick each item that passes, or write **N/A** + a one-line justification
   (e.g. *"N/A — file only changes Tailwind classes"*).
3. For any unchecked item, request changes before approving.
4. Copy this checklist into the PR description and fill it in. Reviewers must
   not approve a PR whose checklist contains unchecked items without an
   associated follow-up issue.

---

## 1. Wallet Connection

Concern: Freighter wallet integration (`src/hooks/useWallet.ts`, `Navbar.tsx`).

- [ ] Wallet state (address, network) is only stored in `useWallet` / zustand;
      no duplicate copies are held in component-local state or `localStorage`.
- [ ] `requestAccess()` is only invoked after a deliberate, user-triggered
      click on a "Connect Wallet" button — never on page load or `useEffect`
      mount.
- [ ] Errors from `isConnected()` / `requestAccess()` are caught and surfaced
      to the user; raw error objects are not silently swallowed.
- [ ] The user-visible error when Freighter is missing is helpful (it tells the
      user where to install it), and it never logs sensitive info to the
      browser console.
- [ ] `connect()` does not store secrets, transaction envelopes, or signing
      key material in the wallet store.- [ ] On `disconnect()`, all wallet-derived state currently held in the store
      (`address`, `network`, and any session metadata added later) is cleared
      from the UI store. When a "pending transactions" slice is added, it must
      also be cleared here.
- [ ] Auto-reconnect / rehydration logic (when implemented) does not persist
      raw secrets — only non-sensitive session metadata.

---

## 2. Signer Prompts

Concern: Triggering Freighter signing prompts for transactions, minting, and
admin operations.

- [ ] A signing prompt is only triggered by an explicit user click
      ("Confirm Transfer", "Mint Asset", "Whitelist User"), never
      programmatically on render or by a timer.
- [ ] The transaction *envelope* (destination, asset code, amount, memo) is
      fully reconstructed and visible to the user **before** invoking the
      signer. Strings, amounts, and addresses are not silently post-edited
      after the user has approved a preview.
- [ ] The UI never auto-confirms via `signTransaction`; the user always
      reviews the prompt that the wallet surfaces.
- [ ] Double-submit is prevented: the sign / mint / transfer button is
      disabled while the prompt is open and re-enabled only on success or
      explicit failure.
- [ ] Signer errors are mapped to user-friendly messages; the raw Freighter
      error is logged to the console for the developer but never shown
      verbatim (it can leak internal IDs).
- [ ] No "preflight" or background signing happens — every `signTransaction`
      call is wired to a user action.

---

## 3. Secret Handling

Concern: Secrets, seeds, API keys, signing keys, session tokens.

- [ ] No raw secret, seed phrase, or private key is ever accepted as a UI
      input. If a *public* address is expected, the input is labeled and
      validated to match Stellar public-key format (`G...`, ~56 chars).
- [ ] No secret-materials are logged via `console.log`, `console.error`, or
      any logger — including in error branches (`catch (err) { console.log(err) }`
      is forbidden for any path that saw signer output).
- [ ] No secrets are placed in `localStorage`, `sessionStorage`, IndexedDB,
      cookies, or URL query strings. `useWallet` state lives in memory only.
- [ ] `.env*` files are not committed; only `NEXT_PUBLIC_*` (non-sensitive)
      variables are read from `process.env`. The PR diff is grepped for
      `process.env` to confirm.
- [ ] No hard-coded API keys, RPC URLs to private networks, or admin
      addresses are introduced — env-driven configuration only.
- [ ] The bundle is reviewed for accidentally-inlined secrets (`grep -R "BEGIN PRIVATE KEY" src/` etc.).
- [ ] Secret-dependent code paths are not reachable from the bundle unless
      the user is on the correct route and authorized (see §6).

---

## 4. Diagnostics Redaction

Concern: `console.*`, error toasts, error boundaries, telemetry.

- [ ] No PII (name, email, KYC ID, real-world address) is written to
      `console.log`, `window` globals, or sent to any analytics sink.
- [ ] Wallet addresses are safe to log, **but** truncated in user-visible
      errors (`truncateAddress`). Full addresses are only shown when the user
      has explicitly opened a "details" view.
- [ ] Transaction hashes are safe to display fully, but they are never
      combined with off-chain identifiers in the same log line.
- [ ] Any `console.error` in production builds is gated to development only
      (e.g. `if (process.env.NODE_ENV !== 'production') console.error(...)`)
      or passes through a redaction helper.
- [ ] Error boundaries and retry paths do not echo raw third-party error
      messages into the DOM. A human-readable message is shown instead.
- [ ] Mock / debug data (e.g. `mock_tx_hash_1234567890`) is not present in any
      production build path — search for `mock_` strings before approving.
- [ ] Any newly-added telemetry or Sentry-style breadcrumbs are reviewed for
      PII leakage.

---

## 5. Transaction Review

Concern: `TransferModal.tsx`, `AssetCard.tsx`, minting flows.

- [ ] Before submitting a transaction, the UI clearly shows the
      **recipient** (truncated by default, expand on click), the **amount**,
      and the **asset ticker**. When a memo field is added to the form, it
      must be shown here as well.
- [ ] The recipient field validates Stellar address format client-side
      before requesting the whitelist check; non-conforming inputs are
      rejected without invoking any signing prompt.
- [ ] Amounts are validated to be positive finite numbers; the UI also
      checks balance > amount before submission to pre-empt obvious
      failures.
- [ ] Compliance / whitelist check (`checkWhitelist`) is performed, and
      the user receives a clear failure message when the recipient is not
      cleared. The check happens **before** any signer prompt.
- [ ] After a successful transaction, the success state shows the truncated
      tx hash and a link to the appropriate explorer. Past transactions
      are not auto-cleared from the state until the user closes the modal.
- [ ] On failure, no partial / phantom success state is rendered. The
      button is re-enabled and the error message is concrete (e.g.
      *"Recipient not whitelisted"*, not *"Something went wrong"*).
- [ ] No path lets the user submit a transaction with a *different*
      recipient than the one they reviewed. The state used by the signer is
      the same object the UI last confirmed.

---

## 6. Wrong-Network Handling

Concern: `useWallet`'s `network` field, network mismatch errors.

- [ ] The connected network (`PUBLIC`, `TESTNET`, `FUTURENET`, `STANDALONE`)
      is read after `requestAccess()` and validated against the
      network the app expects.
- [ ] If the wallet is on the wrong network, the UI blocks the user from
      proceeding with a clear message: *"Switch your Freighter wallet to
      TESTNET and refresh"*. The button is disabled, not just warned.
- [ ] The wrong-network banner is not dismissable in a way that re-enables
      privileged actions.
- [ ] Network info is displayed in the navbar (already present) and the
      display value is non-sensitive — it must not leak RPC URLs or
      internal node identifiers when those are wired up.
- [ ] When a "pending transactions" slice is added, a network switch must
      reset that slice and re-confirm with the user.
- [ ] When a network-specific Soroban RPC URL is wired up, it is selected
      based on the detected network and mismatched combinations fail fast
      (validated at module load). Until then, no hard-coded RPC URL is
      acceptable.

---

## 7. Admin UI

Concern: `src/pages/admin.tsx`, `src/components/AdminPanel.tsx`.

- [ ] Admin-only pages gate on **more than just wallet connection.** PRs that
      remove the `TODO` for admin-key verification (or weaken the gate) are
      blocked. Client-side checks alone are insufficient —server/SDK
      confirmation is required.
- [ ] Privileged buttons ("Mint Asset", "Whitelist User") are disabled when
      no address is entered, when loading, and when the connected wallet is
      not authorized.
- [ ] The admin page does not auto-fire any admin RPC on mount. Every
      privileged action requires an explicit click.
- [ ] Any new admin action surfaces a clear confirmation dialog showing the
      exact effect (asset code, amount, target address) **before** invoking
      the signer.
- [ ] Admin RPC calls surface 1) the type of action, 2) the parameters,
      3) the resulting tx hash, **without** leaking signer keystrokes or
      prompt IDs.
- [ ] Errors from admin operations do not auto-retry; the user has to
      click again. Auto-retry would re-open sign prompts and could leak
      additional prompts to the user.
- [ ] UI-text that warns an admin a flow is "irreversible" matches the
      actual contract semantics.

---

## 8. Compliance

Concern: KYC / whitelist checks (`checkWhitelist`, `useWallet` callers).

- [ ] The compliance check is invoked before any user-facing "Confirm" or
      signer prompt. PRs that reorder these steps are a regression.
- [ ] The compliance failure UI is informative ("Recipient is not
      whitelisted") but does not leak *why* the recipient failed (e.g. it
      must not echo partial KYC records or sanctions matches if/when such
      data is wired up).
- [ ] The compliance cache / store (today: a single `checkWhitelist`
      call-site in `TransferModal`) does not leak across users. Today this
      is implicit; when a cache is added, clearing on `disconnect()` is
      the expectation.
- [ ] No compliance data (whitelist status, KYC IDs) is printed to
      `console.*`. Compliance state is binary `boolean` from the SDK's
      perspective.
- [ ] User-facing copy that references regulations (e.g. *"This asset is
      restricted to accredited investors"*) is reviewed by product before
      merge.

---

## 9. Minting

Concern: `AdminPanel.tsx`'s *Mint Asset* flow.

- [ ] Minting amounts are validated client-side (non-negative, finite, sane
      upper bound) before submission. Server/SDK enforces the real bound.
- [ ] The minting flow always shows the resulting tx hash on success, with
      a copy-to-clipboard or explorer link.
- [ ] Mint failures do not enable retry without an explicit user click.
- [ ] No minting "queue" or batch UI is added unless the underlying
      contract supports it — the PR must reference the SDK method used.
- [ ] Minting never accepts free-form JSON or arbitrary contract method
      names from the user input — only the asset address and amount.

---

## 10. General / Cross-Cutting Concerns

- [ ] All changed `onClick` handlers pass a function reference, not an
      invocation: `onClick={handleMint}` ✓, `onClick={handleMint()}` ✗.
- [ ] No `dangerouslySetInnerHTML` is introduced without an explicit
      `<script>` / comment justification.
- [ ] No new dependencies are added without reviewing their supply-chain
      risk (postinstall scripts, license, weekly-downloads floor).
- [ ] Dependency upgrades do not suddenly remove security headers (CSP,
      HSTS) — verify `next.config.js` if it exists.
- [ ] Tailwind / utility-class changes do not accidentally remove focus
      rings from buttons (a11y + phishing-resistance).
- [ ] TODO / FIXME comments related to security (`TODO: rehydrate wallet`,
      `TODO: verify admin key`) are not removed by a PR that does not
      implement the real fix.

---

## 11. PR Description Requirements

Every PR touching security-sensitive code MUST include, in the description:

1. A link to the relevant `@aegis/sdk` contract method(s) used.
2. A "Threat model" subsection: *What could go wrong if this PR is
   malicious or buggy?* — at least one sentence per changed file.
3. The completed checklist (this document) copied into the PR body.
4. If any item is unchecked, an explicit follow-up issue is linked from
   the PR.

---

## Summary — Quick Triage

| Category       | Most-common regression to look for |
| -------------- | ----------------------------------- |
| Wallet         | Silent re-render triggering `requestAccess` |
| Signer prompts | Auto-fired sign on mount |
| Secrets        | `localStorage` of addresses / RPC URLs |
| Diagnostics    | Verbose `console.error` in production |
| Transactions   | Queueing two transfers with mismatched recipients |
| Network        | Network mismatch treated as a warning, not a block |
| Admin          | Disabling the admin gate for "convenience" |
| Compliance     | Whitelist failure leaks KYC reason |
| Minting        | Auto-retry of failed mints |

When in doubt, **block the PR** and ask for clarification. Aegis handles
real-world assets — over-cautious review is the default.
