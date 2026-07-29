# Contributing to Aegis Dashboard

We love open-source contributions! To ensure a smooth and productive process, please follow the guidelines below.

---

## Setup

```bash
git clone https://github.com/Axionvera/aegis-dashboard.git
cd aegis-dashboard
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

The dev server requires no live Soroban contracts. Set `NEXT_PUBLIC_MOCK_MODE="true"`
in `.env.local` to activate the built-in mock provider. See
[docs/mock-mode.md](docs/mock-mode.md) for fixture data and mock wallet addresses.

---

## Before You Push

Run the full local verification suite and confirm every check is clean:

```bash
npm run lint          # ESLint via next lint — must produce 0 errors
npm run typecheck     # tsc --noEmit — must produce 0 errors
npm test              # Vitest — all tests must pass
npm run build         # Next.js production build — must succeed
```

> **Note:** The test runner is **Vitest**, not Jest. The `jest.config.js` in the
> project root is stale and can be ignored. Do not write Jest-style setup — use the
> Vitest patterns already present in `src/__tests__/`.

CI runs all four steps in the same order. A PR with any red check will not be merged.

---

## Branch Naming

| Change type | Prefix | Example |
|---|---|---|
| New feature | `feat/` | `feat/kyc-badge-component` |
| Bug fix | `fix/` | `fix/asset-card-null-guard` |
| UI-only change | `ui/` | `ui/portfolio-card-spacing` |
| Documentation | `docs/` | `docs/mock-sdk-reference` |
| Refactor | `refactor/` | `refactor/normalise-transaction-status` |

Always include the issue number in the branch name when the branch closes a tracked
issue, e.g. `feat/kyc-badge-component-42`.

---

## Component Placement

| Location | Use for |
|---|---|
| `src/components/` | Shared, reusable components used across two or more pages or features |
| `src/components/layout/` | Layout shell components (Navbar, MobileNav, RouteGuard) |
| `src/components/transactions/` | Transaction-specific shared components |
| `src/features/<domain>/components/` | Components owned by and used only within one feature domain |

When adding a new component directory outside `src/pages/` or `src/components/`,
add its path to the `content` array in `tailwind.config.js` so Tailwind scans it.
Omitting this causes utility classes to be silently dropped from the production build.

---

## Fixtures

Three fixture conventions coexist in this project. Follow the nearest existing pattern
for the area you are working in:

- **Colocated `fixtures.ts`** inside a feature or component folder
  (`src/features/auth/fixtures.ts`, `src/components/transactions/fixtures.ts`)
- **`src/lib/__fixtures__/`** for domain-logic fixtures used across multiple areas
- Do not import fixtures from `src/lib/__fixtures__/` into production pages — use a
  prop or a mock provider instead

---

## Pull Request Requirements

Every PR must satisfy the checklist in `.github/pull_request_template.md`, which
renders automatically when you open a new PR. The short version:

- **UI changes**: attach before/after screenshots at every affected viewport width
- **Logic changes**: add or update automated tests; paste the `npm test` output
- **All changes**: CI must be green before requesting review

See [docs/testing-evidence-requirement.md](docs/testing-evidence-requirement.md) for
the full policy and [docs/contribution-quality-examples.md](docs/contribution-quality-examples.md)
for concrete examples of what passes and what does not.

During GrantFox evaluation windows, review the
[Payment-Period Conduct Policy](docs/payment-period-conduct.md). Repeated payout
complaints, tagging maintainers outside designated threads, and other prohibited
conduct may result in exclusion from the current evaluation window.

---

## For Maintainers and Reviewers

Before approving or merging a pull request, please follow the **[Reviewer Quality Checklist](docs/reviewer-checklist.md)**. This checklist covers:

- PR hygiene and scope verification
- Implementation completeness against acceptance criteria
- Code quality and architectural consistency
- Styling and responsiveness standards
- Test coverage and manual verification
- CI pipeline status
- Security and sensitive data checks
- Documentation completeness

A condensed version of the checklist is also embedded in the [pull request template](.github/pull_request_template.md) for convenient use during reviews.

---

## Documentation Index

A full index of every file in `docs/` organised by audience is at
[docs/README.md](docs/README.md).
