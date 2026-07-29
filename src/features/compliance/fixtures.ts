/**
 * Fixtures for address-level compliance status panel development and tests.
 *
 * All addresses are synthetic Stellar-style keys and do not represent real
 * accounts or real KYC decisions.
 */

import { mapAddressComplianceStatus } from '@/features/compliance/statusMap';
import type {
  AddressComplianceStatus,
  RawAddressComplianceRecord,
} from '@/features/compliance/types';

export const addressComplianceFixtureInputs: RawAddressComplianceRecord[] = [
  {
    address: 'GCFXCOMPAPPROVED0000000000000000000000000000000000000',
    status: 'approved',
    reasonCode: 'REGISTRY_APPROVED',
    evaluatedAt: '2026-07-28T10:00:00.000Z',
    detail:
      'This address is currently marked approved in the protocol compliance registry for dashboard actions.',
  },
  {
    address: 'GCFXCOMPBLOCKED00000000000000000000000000000000000000',
    status: 'blocked',
    reasonCode: 'REGISTRY_BLOCKED',
    evaluatedAt: '2026-07-28T10:05:00.000Z',
    detail:
      'This address is currently blocked from protocol actions by the compliance registry.',
  },
  {
    address: 'GCFXCOMPPENDING00000000000000000000000000000000000000',
    status: 'pending',
    reasonCode: 'AWAITING_REVIEW',
    evaluatedAt: '2026-07-28T10:10:00.000Z',
    detail:
      'Compliance review for this address is still pending in the protocol registry.',
  },
  {
    address: 'GCFXCOMPREVOKED000000000000000000000000000000000000000',
    status: 'revoked',
    reasonCode: 'APPROVAL_REVOKED',
    evaluatedAt: '2026-07-28T10:15:00.000Z',
    detail:
      'Prior protocol approval for this address has been revoked in the compliance registry.',
  },
  {
    address: 'GCFXCOMPUNKNOWN00000000000000000000000000000000000000',
    status: 'unknown',
    reasonCode: 'NO_RECORD',
    evaluatedAt: '2026-07-28T10:20:00.000Z',
  },
  {
    address: 'GCFXCOMPUNAVAILABLE000000000000000000000000000000000',
    status: 'unavailable',
    unavailable: true,
    reasonCode: 'REGISTRY_TIMEOUT',
    detail:
      'Compliance data for this address could not be retrieved right now. Try again later.',
  },
];

export const addressComplianceFixtures: AddressComplianceStatus[] =
  addressComplianceFixtureInputs.map((record) =>
    mapAddressComplianceStatus(record, 'fixture'),
  );

/** Lookup table used by the mock SDK provider. */
export const addressComplianceFixtureByAddress = Object.fromEntries(
  addressComplianceFixtureInputs.map((record) => [record.address, record]),
) as Record<string, RawAddressComplianceRecord>;
