import type { ComplianceSubject } from "@/lib/complianceReview";

/**
 * Example fixture representing a realistic bulk compliance review queue.
 * Identifiers are illustrative Stellar-style addresses — do NOT treat as real
 * accounts. No PII is included; jurisdiction codes are reference-only.
 */
export const sampleSubjects: ComplianceSubject[] = [
  {
    id: "GBKP7K3F6XN3V9QZ2WY8L4M1T5R6S7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P",
    status: "pending",
    severity: "critical",
    meta: { jurisdiction: "US", tier: "accredited" },
    checks: [
      { key: "kyc_verified", label: "KYC Verified", result: "pass", evaluatedAt: "2026-07-20T10:00:00Z" },
      { key: "accreditation", label: "Accreditation", result: "unknown", detail: "Pending attestation" },
      { key: "sanctions", label: "Sanctions Screen", result: "pass" },
    ],
  },
  {
    id: "GAAQ1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F",
    status: "approved",
    severity: "low",
    meta: { jurisdiction: "EU", tier: "retail" },
    checks: [
      { key: "kyc_verified", label: "KYC Verified", result: "pass" },
      { key: "accreditation", label: "Accreditation", result: "pass" },
      { key: "sanctions", label: "Sanctions Screen", result: "pass" },
    ],
  },
  {
    id: "GCZ9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3H2G1F0E9D8C7B6A5S4R3T2U1V0W9X8",
    status: "review",
    severity: "high",
    meta: { jurisdiction: "SG", tier: "professional" },
    checks: [
      { key: "kyc_verified", label: "KYC Verified", result: "pass" },
      { key: "accreditation", label: "Accreditation", result: "warn", detail: "Expires 2026-08-15" },
      { key: "sanctions", label: "Sanctions Screen", result: "pass" },
    ],
  },
  {
    id: "GD4F3E2D1C0B9A8Z7Y6X5W4V3U2T1S0R9Q8P7O6N5M4L3K2J1H0G9F8E7D6C5B4A3Z2Y",
    status: "rejected",
    severity: "medium",
    meta: { jurisdiction: "XX", tier: "unknown" },
    checks: [
      { key: "kyc_verified", label: "KYC Verified", result: "fail", detail: "Document expired" },
      { key: "accreditation", label: "Accreditation", result: "unknown" },
      { key: "sanctions", label: "Sanctions Screen", result: "pass" },
    ],
  },
];
