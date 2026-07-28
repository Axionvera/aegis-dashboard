# Admin Role Management — UI Design & Implementation Plan

> **Status:** Design-first (FWC26 / issue #56)
> **Type:** Documentation / Design
> **Risk class:** Security-sensitive — implementation MUST NOT begin until this
> design is reviewed and explicitly approved by a maintainer.

Role management is security-sensitive. This document defines *how* admin role
management would work in the Aegis Dashboard **before** any code is written, so
the approach, permission boundaries, risks, and approval flow are agreed up
front.

---

## 1. Goals & Non-Goals

### Goals
- Define a clear, least-privilege role model for dashboard administrators.
- Provide a permission matrix that maps every privileged action to a role.
- Describe the proposed UI screens and user flow for managing roles.
- Document the security risks and the mitigations that must ship *with* any
  implementation.
- List concrete implementation tasks so the work is actionable after approval.

### Non-Goals (this document)
- No production code. This is a design artifact only.
- No changes to on-chain contracts. Role enforcement, if adopted, would live
  behind an off-chain admin service / API that the dashboard calls; on-chain
  privilege (e.g. `require_admin`) is out of scope here.
- No introduction of real privileged accounts or secrets.

---

## 2. Proposed Role Model

A three-tier model keeps the privilege surface small and auditable:

| Role | Scope | Can do |
|------|-------|--------|
| `viewer` | Read-only | View dashboards, reports, compliance status. No mutations. |
| `operator` | Day-to-day ops | `viewer` + ack alerts, run read-only diagnostics, export reports. No role changes. |
| `admin` | Full privilege | `operator` + manage roles, invite/revoke admins, configure settings. |

> **Design decision:** There is intentionally **no** "super-admin" above
> `admin`. All `admin` accounts are equal peers so no single account is
> irreplaceable and privilege escalation requires consensus (see §5).

---

## 3. Permission Matrix

Legend: ✅ allowed · ❌ denied

| Capability | `viewer` | `operator` | `admin` |
|------------|:--------:|:---------:|:-------:|
| View dashboards & reports | ✅ | ✅ | ✅ |
| Export / download reports | ✅ | ✅ | ✅ |
| Acknowledge alerts | ❌ | ✅ | ✅ |
| Run diagnostics (read-only) | ❌ | ✅ | ✅ |
| View audit log | ✅ | ✅ | ✅ |
| Manage own API keys | ❌ | ✅ | ✅ |
| Invite `viewer` / `operator` | ❌ | ❌ | ✅ |
| Revoke `viewer` / `operator` | ❌ | ❌ | ✅ |
| Promote to / demote from `admin` | ❌ | ❌ | ⚠️ 2-of-N |
| Revoke an `admin` | ❌ | ❌ | ⚠️ 2-of-N |
| Change global settings | ❌ | ❌ | ✅ |
| Delete audit log | ❌ | ❌ | ❌ (never) |

**2-of-N** = requires approval from a second distinct `admin` before the action
takes effect (see §5). The audit log is **immutable** by design — no role,
including `admin`, may delete it.

---

## 4. Proposed UI Flow

### 4.1 Screens
1. **Roles & Admins** (`/admin/roles`) — table of all accounts with their
   current role, last-active, and who granted it. Admin-only.
2. **Invite Member** (modal) — pick email + role (`viewer`/`operator` only;
   `admin` invites go through the 2-of-N flow).
3. **Role Detail** (drawer) — shows granted-by, granted-at, and a
   "Revoke" / "Change role" action (gated by permission matrix).
4. **Pending Approvals** (`/admin/approvals`) — lists actions awaiting a second
   `admin` sign-off (promotions, admin revocations).
5. **Audit Log** (`/admin/audit`) — read-only, filterable by actor / action /
   time. Immutable.

### 4.2 Happy-path flow (invite an operator)
```
Dashboard → Admin → Roles & Admins
  → "Invite" → enter email, select role=operator
  → confirm → backend creates pending invite (operator, no 2nd approval needed)
  → invitee accepts → row flips to active
```

### 4.3 Sensitive flow (promote to admin — 2-of-N)
```
Admin A → Roles & Admins → Invite → role=admin
  → confirm → action enters "Pending Approvals" (status: awaiting 2nd admin)
Admin B → Approvals → reviews request → "Approve"
  → both signatures recorded → role granted
  → event written to immutable Audit Log
```
If Admin B rejects, the request is closed and logged; no role change occurs.

### 4.4 Guardrails in the UI
- Every destructive / privileged action shows a confirmation with the exact
  permission being changed.
- `admin`-only screens render a persistent "Admin area" banner.
- The currently signed-in admin **cannot** revoke or demote themselves (prevents
  self-lockout and rogue self-escalation); a second admin must act.
- All privileged actions are disabled until the session has re-authenticated
  (step-up auth) within the last N minutes.

---

## 5. Approval & Escalation Flow

To prevent a single compromised `admin` account from taking over the system:

- **Promote-to-admin** and **revoke-admin** require **two distinct admins**
  (2-of-N multisig-style approval at the API layer).
- Each approval step is an independently authenticated, logged event.
- The audit log records: `actor`, `action`, `target`, `timestamp`,
  `approval-status`, `second-approver` (when applicable).
- A rejected or expired request (e.g. > 24h pending) is auto-closed and logged.

---

## 6. Risk Notes & Required Mitigations

| # | Risk | Impact | Mitigation (must ship with impl) |
|---|------|--------|----------------------------------|
| R1 | Single admin account compromise | Full takeover | 2-of-N for admin grants/revokes (§5) |
| R2 | Privilege creep (operator→admin drift) | Silent escalation | Role changes are explicit, logged, and 2-of-N for admin |
| R3 | Self-revocation / self-lockout | Loss of admin access | Signed-in admin cannot act on own admin record |
| R4 | Audit log tampering | Undetectable abuse | Audit log immutable; no role can delete it |
| R5 | Session theft | Impersonation | Step-up auth for privileged actions; short privileged-session TTL |
| R6 | Phishing / CSRF on admin endpoints | Unauthorized change | CSRF tokens, strict CORS, origin checks |
| R7 | Over-broad client trust | Client bypasses checks | **All** authorization enforced server-side; UI is advisory only |
| R8 | Leaked secrets / keys | Account takeover | No secrets in client; rotate + vault-managed server keys |

> **Key principle (R7):** The dashboard UI never enforces authorization. The
> backing API is the single source of truth and re-checks the caller's role on
> every request. UI gating is UX only.

---

## 7. Implementation Plan (post-approval only)

> Ordered so that **security scaffolding lands before any privileged feature**.

1. **API contract** — define role enum, permission checks, and the 2-of-N
   approval primitive in the admin service. Server-side enforcement only.
2. **Audit log** — append-only store + read API; wire every role mutation.
3. **Auth/session** — step-up re-auth for privileged actions; privileged-session
   TTL.
4. **RBAC middleware** — reuse the permission matrix (§3) as the single
   decision table for every endpoint.
5. **Frontend shell** — `/admin/roles`, `/admin/approvals`, `/admin/audit`
   routes + Admin-area banner, gated by the same matrix.
6. **Invite / revoke flows** — viewer/operator first (no 2nd approval); then
   admin promote/revoke with 2-of-N.
7. **Tests** — unit tests for the matrix + approval flow; integration tests that
   assert a single admin **cannot** self-escalate or delete the audit log.
8. **Docs** — this design doc + a runtime "Admin & Roles" runbook.

### Suggested file layout (implementation phase)
```
src/features/admin/
  permissions.ts        # the §3 matrix as code (single source of truth)
  useRoles.ts           # hooks: list/update roles (calls API)
  usePendingApprovals.ts
src/components/admin/
  RolesTable.tsx
  InviteMemberModal.tsx
  RoleDetailDrawer.tsx
  PendingApprovals.tsx
  AuditLog.tsx
src/pages/admin/
  roles.tsx
  approvals.tsx
  audit.tsx
```

---

## 8. Open Questions (for maintainer review)
- Should `operator` be able to invite other `operator`s, or only `admin`?
- What is the max `admin` count before 2-of-N becomes unwieldy (N-of-M)?
- Where does the immutable audit log physically live (on-chain anchor vs.
  signed off-chain append-only store)?
- Does role state live in the dashboard's own backend, or is it derived from an
  existing identity provider?

---

## 9. Acceptance Criteria (issue #56)
- [x] Role management design is added (this document).
- [x] Permission matrix is included (§3).
- [x] Admin risks are documented (§6).
- [x] Proposed UI flow is described (§4).
- [x] Implementation tasks are listed (§7).
- [x] README links to this design (see repo README → Documentation).
