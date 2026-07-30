/**
 * Tests for src/lib/status/domainMappers.ts (Issue #182).
 *
 * Confirms every value of every domain's status enum maps to a valid
 * StatusInfo, and spot-checks a few semantically important cases (e.g. a
 * rejected/restricted/failed status must never map to a 'success' tone).
 */

import {
  statusForComplianceState,
  statusForReviewSeverity,
  statusForTransferEligibility,
  statusForAssetLifecycle,
  statusForIssuanceRequest,
  statusForTransaction,
  statusForWhitelistEntry,
  statusForDiagnostics,
} from './domainMappers';
import { SEVERITY_ORDER } from './severity';
import type { StatusInfo } from './types';

const VALID_TONES = ['success', 'neutral', 'caution', 'critical', 'unknown'];

function expectValidStatusInfo(result: StatusInfo) {
  expect(typeof result.label).toBe('string');
  expect(result.label.length).toBeGreaterThan(0);
  expect(VALID_TONES).toContain(result.tone);
  expect(SEVERITY_ORDER).toContain(result.severity);
}

describe('statusForComplianceState', () => {
  it.each(['compliant', 'restricted', 'pending_review'] as const)(
    'produces a valid StatusInfo for %s',
    (state) => {
      expectValidStatusInfo(statusForComplianceState(state));
    },
  );

  it('never maps restricted to a success tone', () => {
    expect(statusForComplianceState('restricted').tone).not.toBe('success');
    expect(statusForComplianceState('restricted').tone).toBe('critical');
  });

  it('maps compliant to success', () => {
    expect(statusForComplianceState('compliant').tone).toBe('success');
  });
});

describe('statusForReviewSeverity', () => {
  it.each(['low', 'medium', 'high', 'critical'] as const)(
    'produces a valid StatusInfo for %s and preserves the severity value',
    (severity) => {
      const result = statusForReviewSeverity(severity);
      expectValidStatusInfo(result);
      expect(result.severity).toBe(severity);
    },
  );

  it('maps critical severity to the critical tone', () => {
    expect(statusForReviewSeverity('critical').tone).toBe('critical');
  });
});

describe('statusForTransferEligibility', () => {
  it.each(['eligible', 'ineligible', 'unknown'] as const)(
    'produces a valid StatusInfo for %s',
    (state) => {
      expectValidStatusInfo(statusForTransferEligibility(state));
    },
  );

  it('never maps ineligible to a success tone', () => {
    expect(statusForTransferEligibility('ineligible').tone).not.toBe('success');
  });
});

describe('statusForAssetLifecycle', () => {
  it.each(['active', 'paused', 'matured', 'redeemed', 'defaulted'] as const)(
    'produces a valid StatusInfo for %s',
    (state) => {
      expectValidStatusInfo(statusForAssetLifecycle(state));
    },
  );

  it('maps defaulted to critical and active to success, matching LIFECYCLE_STATE_INFO tones', () => {
    expect(statusForAssetLifecycle('defaulted').tone).toBe('critical');
    expect(statusForAssetLifecycle('active').tone).toBe('success');
  });

  it('carries over the existing lifecycle label and detail text verbatim', () => {
    const result = statusForAssetLifecycle('paused');
    expect(result.label).toBe('Paused');
    expect(result.detail).toContain('paused');
  });
});

describe('statusForIssuanceRequest', () => {
  it.each(['draft', 'pending', 'approved', 'minted', 'rejected'] as const)(
    'produces a valid StatusInfo for %s',
    (status) => {
      expectValidStatusInfo(statusForIssuanceRequest(status));
    },
  );

  it('never maps rejected to a success tone', () => {
    expect(statusForIssuanceRequest('rejected').tone).toBe('critical');
  });

  it('maps both approved and minted to success', () => {
    expect(statusForIssuanceRequest('approved').tone).toBe('success');
    expect(statusForIssuanceRequest('minted').tone).toBe('success');
  });
});

describe('statusForTransaction', () => {
  it.each(['success', 'pending', 'failed', 'unknown'] as const)(
    'produces a valid StatusInfo for %s',
    (status) => {
      expectValidStatusInfo(statusForTransaction(status));
    },
  );

  it('maps failed to critical and success to success', () => {
    expect(statusForTransaction('failed').tone).toBe('critical');
    expect(statusForTransaction('success').tone).toBe('success');
  });
});

describe('statusForWhitelistEntry', () => {
  it.each(['whitelisted', 'revoked'] as const)(
    'produces a valid StatusInfo for %s',
    (status) => {
      expectValidStatusInfo(statusForWhitelistEntry(status));
    },
  );

  it('maps whitelisted to success and revoked to a non-critical tone', () => {
    expect(statusForWhitelistEntry('whitelisted').tone).toBe('success');
    expect(statusForWhitelistEntry('revoked').tone).not.toBe('critical');
  });
});

describe('statusForDiagnostics', () => {
  it.each(['ok', 'warning', 'error', 'unknown'] as const)(
    'produces a valid StatusInfo for %s',
    (status) => {
      expectValidStatusInfo(statusForDiagnostics(status));
    },
  );

  it('maps error to critical and ok to success', () => {
    expect(statusForDiagnostics('error').tone).toBe('critical');
    expect(statusForDiagnostics('ok').tone).toBe('success');
  });
});
