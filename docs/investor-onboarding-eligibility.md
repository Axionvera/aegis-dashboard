# Investor Onboarding Eligibility Page

Explains whether a connected wallet is eligible to onboard to the Aegis
platform — based on network, KYC status, and whether it is already registered.
(Issue #28.)

## Why it exists

Prospective investors need a clear, self-service way to understand where they
stand in the onboarding process before they can access the portfolio or
transfer assets. This page surfaces a human-readable explanation instead of
a bare role-denied error.

## States

| State | Meaning | Example trigger |
|-------|---------|-----------------|
| `compliant` | Appears eligible based on known info; final say is on-chain. | Wallet connected, right network, KYC complete, not yet registered. |
| `blocked` | Onboarding should not proceed. | Wrong network, KYC not completed. |
| `unknown` | Cannot verify — **does not** assert allow or block. | KYC status unknown or service unavailable. |

(Note: the `unavailable` state is part of the shared EligibilityState type but
not emitted by the onboarding evaluation; asset pause does not apply to
onboarding.)

## Evaluation precedence (fail-closed)

1. Service unavailable → `unknown` (never claim compliant/blocked).
2. Wallet on unsupported network → `blocked`.
3. KYC not completed → `blocked`.
4. Already onboarded → `compliant` (nothing to do).
5. KYC status unknown → `unknown`.
6. Otherwise → `compliant`.

## Copy guardrails (no legal overclaiming)

- The panel is **informational**; on-chain approval is final.
- `unknown` copy explicitly states it is *not* a confirmation of allow/block.
- The compliance disclaimer from `COMPLIANCE_DISCLAIMER` is rendered in the
  panel footer. See [Compliance-Safe Wording](compliance-safe-wording.md).

## Files

- `src/lib/eligibility.ts` — `evaluateOnboardingEligibility()` pure function.
- `src/lib/__fixtures__/eligibility.ts` — onboarding fixture inputs.
- `src/features/investor/OnboardingEligibilityPanel.tsx` — the UI panel.
- `src/features/investor/OnboardingEligibilityPanel.test.tsx` — component tests.
- `src/lib/eligibility.test.ts` — engine unit tests for onboarding.
- `src/pages/onboarding.tsx` — the page, available without a role guard.
- `src/features/auth/routes.ts` — route entry for nav visibility.

## SDK mapping

The page feeds real-time signals into `OnboardingEligibilityInput`:

- `walletOnSupportedNetwork` ← connected wallet network.
- `kycCompleted` ← `useAegis().checkWhitelist(address)`.
- `alreadyOnboarded` ← resolved `DashboardRole` is not null.
- `serviceAvailable` ← SDK loading state.

Until the `@aegis/sdk` is wired, the mock provider returns deterministic
KYC results and the page works entirely with mocked data.
