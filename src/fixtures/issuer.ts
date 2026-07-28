/**
 * src/fixtures/issuer.ts
 *
 * Mock asset issuance request data for the Issuer Console table view.
 *
 * All identifiers are synthetic. Covers all issuance lifecycle states:
 * draft, pending, approved, minted, rejected.
 */

export interface IssuanceRequest {
  id: string;
  assetName: string;
  ticker: string;
  amount: number;
  jurisdiction: string;
  status: 'draft' | 'pending' | 'approved' | 'minted' | 'rejected';
  requestedAt: string;
  requestedBy: string;
}

export const mockIssuanceRequests: IssuanceRequest[] = [
  {
    id: 'ISS-001',
    assetName: 'Manhattan Commercial Real Estate',
    ticker: 'NY-CRE',
    amount: 100_000,
    jurisdiction: 'US',
    status: 'minted',
    requestedAt: '2026-07-15T08:30:00Z',
    requestedBy: 'GBKP7K3F6XN3V9QZ2WY8L4M1T5R6S7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P',
  },
  {
    id: 'ISS-002',
    assetName: 'Frankfurt Logistics Fund',
    ticker: 'FR-LOG',
    amount: 250_000,
    jurisdiction: 'EU',
    status: 'approved',
    requestedAt: '2026-07-18T14:15:00Z',
    requestedBy: 'GAAQ1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F',
  },
  {
    id: 'ISS-003',
    assetName: 'Singapore Private Credit Note',
    ticker: 'SG-PCN',
    amount: 75_000,
    jurisdiction: 'SG',
    status: 'pending',
    requestedAt: '2026-07-20T10:45:00Z',
    requestedBy: 'GCZ9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4J3H2G1F0E9D8C7B6A5S4R3T2U1V0W9X8',
  },
  {
    id: 'ISS-004',
    assetName: 'US Treasury Bill 6-Mo',
    ticker: 'UST-6M',
    amount: 500_000,
    jurisdiction: 'US',
    status: 'draft',
    requestedAt: '2026-07-21T09:00:00Z',
    requestedBy: 'GD4F3E2D1C0B9A8Z7Y6X5W4V3U2T1S0R9Q8P7O6N5M4L3K2J1H0G9F8E7D6C5B4A3Z2Y',
  },
  {
    id: 'ISS-005',
    assetName: 'Tokyo Green Bond Series A',
    ticker: 'TK-GBA',
    amount: 1_000_000,
    jurisdiction: 'JP',
    status: 'pending',
    requestedAt: '2026-07-22T16:20:00Z',
    requestedBy: 'GCFXMOCKALICE000000000000000000000000000000000000000000000000',
  },
  {
    id: 'ISS-006',
    assetName: 'Dubai Real Estate Trust',
    ticker: 'DXB-RE',
    amount: 350_000,
    jurisdiction: 'AE',
    status: 'rejected',
    requestedAt: '2026-07-10T11:30:00Z',
    requestedBy: 'GCFXMOCKBOB0000000000000000000000000000000000000000000000000',
  },
  {
    id: 'ISS-007',
    assetName: 'London Infrastructure Bond',
    ticker: 'LON-INF',
    amount: 650_000,
    jurisdiction: 'GB',
    status: 'approved',
    requestedAt: '2026-07-19T07:45:00Z',
    requestedBy: 'GCFXMOCKCHARLIE00000000000000000000000000000000000000000000',
  },
  {
    id: 'ISS-008',
    assetName: 'Zurich Private Equity Fund',
    ticker: 'ZRH-PE',
    amount: 420_000,
    jurisdiction: 'CH',
    status: 'draft',
    requestedAt: '2026-07-23T13:00:00Z',
    requestedBy: 'GCFXMOCKDIANA000000000000000000000000000000000000000000000',
  },
];
