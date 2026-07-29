import { describe, expect, it } from 'vitest';
import {
  ADDRESS_COMPLIANCE_PRESENTATION,
  mapAddressComplianceStatus,
  normalizeAddressComplianceState,
  unavailableComplianceStatus,
} from '@/features/compliance/statusMap';
import { addressComplianceFixtures } from '@/features/compliance/fixtures';

describe('normalizeAddressComplianceState', () => {
  it('maps approved aliases', () => {
    expect(normalizeAddressComplianceState('approved')).toBe('approved');
    expect(normalizeAddressComplianceState('COMPLIANT')).toBe('approved');
    expect(normalizeAddressComplianceState('whitelisted')).toBe('approved');
  });

  it('maps blocked aliases including rejected', () => {
    expect(normalizeAddressComplianceState('blocked')).toBe('blocked');
    expect(normalizeAddressComplianceState('rejected')).toBe('blocked');
  });

  it('maps revoked aliases including not-approved', () => {
    expect(normalizeAddressComplianceState('revoked')).toBe('revoked');
    expect(normalizeAddressComplianceState('not_approved')).toBe('revoked');
  });

  it('maps pending, unknown, and unavailable', () => {
    expect(normalizeAddressComplianceState('pending_review')).toBe('pending');
    expect(normalizeAddressComplianceState('something-else')).toBe('unknown');
    expect(normalizeAddressComplianceState('approved', true)).toBe('unavailable');
  });
});

describe('mapAddressComplianceStatus', () => {
  it('produces panel-safe records for every major state fixture', () => {
    const states = new Set(addressComplianceFixtures.map((item) => item.state));
    expect(states.has('approved')).toBe(true);
    expect(states.has('blocked')).toBe(true);
    expect(states.has('pending')).toBe(true);
    expect(states.has('revoked')).toBe(true);
    expect(states.has('unknown')).toBe(true);
    expect(states.has('unavailable')).toBe(true);
  });

  it('falls back to presentation copy when detail is missing', () => {
    const mapped = mapAddressComplianceStatus({
      address: 'GTEST',
      status: 'pending',
    });

    expect(mapped.label).toBe('Pending');
    expect(mapped.explanation).toBe(ADDRESS_COMPLIANCE_PRESENTATION.pending.explanation);
  });

  it('preserves provider detail when present', () => {
    const mapped = mapAddressComplianceStatus({
      address: 'GTEST',
      status: 'revoked',
      detail: 'Custom protocol note',
    });

    expect(mapped.explanation).toBe('Custom protocol note');
  });
});

describe('unavailableComplianceStatus', () => {
  it('returns an unavailable fallback without throwing', () => {
    const fallback = unavailableComplianceStatus('GTEST', 'timeout');
    expect(fallback.state).toBe('unavailable');
    expect(fallback.explanation).toBe('timeout');
    expect(fallback.source).toBe('fallback');
  });
});
