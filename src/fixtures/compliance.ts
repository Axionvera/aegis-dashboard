/**
 * src/fixtures/compliance.ts
 *
 * Mock compliance review queue for local development.
 *
 * All identifiers are Stellar-style addresses that are clearly synthetic —
 * they do NOT represent real accounts or actual compliance decisions.
 * Jurisdiction codes and tier labels are reference values only.
 *
 * Covers all reviewable states: pending, approved, review, and rejected.
 *
 * Consumed by: DiagnosticsPanel, BulkComplianceReview (mock path), tests.
 */

import type { ComplianceSubject } from '@/lib/complianceReview';

export const mockComplianceSubjects: ComplianceSubject[] = [
  {
    id: 'GCFXMOCKALICE000000000000000000000000000000000000000000000000',
    status: 'pending',
    severity: 'critical',
    meta: { jurisdiction: 'US', tier: 'accredited' },
    checks: [
      {
        key: 'kyc_verified',
        label: 'KYC Verified',
        result: 'pass',
        evaluatedAt: '2026-07-20T10:00:00Z',
      },
      {
        key: 'accreditation',
        label: 'Accreditation',
        result: 'unknown',
        detail: 'Pending attestation from compliance desk',
      },
      {
        key: 'sanctions',
        label: 'Sanctions Screen',
        result: 'pass',
      },
    ],
  },
  {
    id: 'GCFXMOCKBOB0000000000000000000000000000000000000000000000000',
    status: 'approved',
    severity: 'low',
    meta: { jurisdiction: 'EU', tier: 'retail' },
    checks: [
      {
        key: 'kyc_verified',
        label: 'KYC Verified',
        result: 'pass',
      },
      {
        key: 'accreditation',
        label: 'Accreditation',
        result: 'pass',
      },
      {
        key: 'sanctions',
        label: 'Sanctions Screen',
        result: 'pass',
      },
    ],
  },
  {
    id: 'GCFXMOCKCHARLIE00000000000000000000000000000000000000000000',
    status: 'review',
    severity: 'high',
    meta: { jurisdiction: 'SG', tier: 'professional' },
    checks: [
      {
        key: 'kyc_verified',
        label: 'KYC Verified',
        result: 'pass',
      },
      {
        key: 'accreditation',
        label: 'Accreditation',
        result: 'warn',
        detail: 'Accreditation expires 2026-08-15 — renewal required',
      },
      {
        key: 'sanctions',
        label: 'Sanctions Screen',
        result: 'pass',
      },
    ],
  },
  {
    id: 'GCFXMOCKDIANA000000000000000000000000000000000000000000000',
    status: 'rejected',
    severity: 'medium',
    meta: { jurisdiction: 'XX', tier: 'unknown' },
    checks: [
      {
        key: 'kyc_verified',
        label: 'KYC Verified',
        result: 'fail',
        detail: 'Government-issued ID document expired — re-submission required',
      },
      {
        key: 'accreditation',
        label: 'Accreditation',
        result: 'unknown',
      },
      {
        key: 'sanctions',
        label: 'Sanctions Screen',
        result: 'pass',
      },
    ],
  },
  {
    id: 'GCFXMOCKEVE0000000000000000000000000000000000000000000000000',
    status: 'pending',
    severity: 'low',
    meta: { jurisdiction: 'GB', tier: 'accredited' },
    checks: [
      {
        key: 'kyc_verified',
        label: 'KYC Verified',
        result: 'pass',
      },
      {
        key: 'accreditation',
        label: 'Accreditation',
        result: 'pass',
      },
      {
        key: 'sanctions',
        label: 'Sanctions Screen',
        result: 'unknown',
        detail: 'Awaiting third-party screening provider response',
      },
    ],
  },
];
