import { describe, it, expect } from 'vitest';
import { evaluateEligibility, evaluateBothDirections, evaluateOnboardingEligibility } from './eligibility';
import {
  FIXTURE_COMPLIANT_SEND,
  FIXTURE_COMPLIANT_RECEIVE,
  FIXTURE_BLOCKED_WALLET_KYC,
  FIXTURE_BLOCKED_NETWORK,
  FIXTURE_BLOCKED_ASSET,
  FIXTURE_UNAVAILABLE_PAUSED,
  FIXTURE_UNKNOWN_SERVICE_DOWN,
  FIXTURE_UNKNOWN_PARTIAL,
  ONBOARDING_COMPLIANT,
  ONBOARDING_BLOCKED_NETWORK,
  ONBOARDING_BLOCKED_KYC,
  ONBOARDING_UNKNOWN_SERVICE_DOWN,
} from './__fixtures__/eligibility';

describe('evaluateEligibility — compliant', () => {
  it('returns compliant for a fully-verified send', () => {
    const r = evaluateEligibility(FIXTURE_COMPLIANT_SEND);
    expect(r.state).toBe('compliant');
    expect(r.assetSpecific).toBe(true);
    expect(r.title).toBe('Eligible');
  });

  it('returns compliant for a fully-verified receive', () => {
    const r = evaluateEligibility(FIXTURE_COMPLIANT_RECEIVE);
    expect(r.state).toBe('compliant');
  });

  it('is direction-aware in copy but same state for both directions', () => {
    const both = evaluateBothDirections({
      walletCompliant: true,
      walletOnSupportedNetwork: true,
      asset: { ticker: 'AEG', compliant: true },
      serviceAvailable: true,
    });
    expect(both.send.state).toBe('compliant');
    expect(both.receive.state).toBe('compliant');
    expect(both.send.message).toContain('send');
    expect(both.receive.message).toContain('receive');
  });
});

describe('evaluateEligibility — blocked', () => {
  it('blocks when wallet KYC is not compliant', () => {
    const r = evaluateEligibility(FIXTURE_BLOCKED_WALLET_KYC);
    expect(r.state).toBe('blocked');
    expect(r.message).toMatch(/compliance|KYC/i);
  });

  it('blocks when wallet is on an unsupported network', () => {
    const r = evaluateEligibility(FIXTURE_BLOCKED_NETWORK);
    expect(r.state).toBe('blocked');
    expect(r.message).toMatch(/network/i);
  });

  it('blocks on asset-specific restriction and flags assetSpecific', () => {
    const r = evaluateEligibility(FIXTURE_BLOCKED_ASSET);
    expect(r.state).toBe('blocked');
    expect(r.assetSpecific).toBe(true);
    expect(r.message).toContain('accredited');
  });
});

describe('evaluateEligibility — unavailable', () => {
  it('marks unavailable when asset is paused (never claims blocked/compliant)', () => {
    const r = evaluateEligibility(FIXTURE_UNAVAILABLE_PAUSED);
    expect(r.state).toBe('unavailable');
  });
});

describe('evaluateEligibility — unknown (no overclaiming)', () => {
  it('returns unknown when the service is unavailable', () => {
    const r = evaluateEligibility(FIXTURE_UNKNOWN_SERVICE_DOWN);
    expect(r.state).toBe('unknown');
  });

  it('returns unknown when compliance is partially known', () => {
    const r = evaluateEligibility(FIXTURE_UNKNOWN_PARTIAL);
    expect(r.state).toBe('unknown');
  });

  it('unknown copy explicitly avoids confirming allow/block', () => {
    const r = evaluateEligibility(FIXTURE_UNKNOWN_SERVICE_DOWN);
    expect(r.message).toMatch(/not a confirmation|allowed or blocked/i);
  });
});

describe('evaluateEligibility — precedence', () => {
  it('service-down wins over everything (fail-closed)', () => {
    const r = evaluateEligibility({
      direction: 'send',
      walletCompliant: true,
      walletOnSupportedNetwork: false,
      asset: { ticker: 'AEG', compliant: false, assetPaused: true },
      serviceAvailable: false,
    });
    expect(r.state).toBe('unknown');
  });

  it('asset pause beats wallet/network issues', () => {
    const r = evaluateEligibility({
      direction: 'send',
      walletCompliant: false,
      walletOnSupportedNetwork: false,
      asset: { ticker: 'AEG', compliant: false, assetPaused: true },
      serviceAvailable: true,
    });
    expect(r.state).toBe('unavailable');
  });

  it('network block beats asset/wallet compliance block', () => {
    const r = evaluateEligibility({
      direction: 'send',
      walletCompliant: false,
      walletOnSupportedNetwork: false,
      asset: { ticker: 'AEG', compliant: false },
      serviceAvailable: true,
    });
    expect(r.state).toBe('blocked');
    expect(r.message).toMatch(/network/i);
  });
});

describe('fixtures coverage', () => {
  it('covers all four states across the fixture set', () => {
    const states = new Set(
      [
        FIXTURE_COMPLIANT_SEND,
        FIXTURE_BLOCKED_WALLET_KYC,
        FIXTURE_UNAVAILABLE_PAUSED,
        FIXTURE_UNKNOWN_SERVICE_DOWN,
      ].map((f) => evaluateEligibility(f).state),
    );
    expect(states.has('compliant')).toBe(true);
    expect(states.has('blocked')).toBe(true);
    expect(states.has('unavailable')).toBe(true);
    expect(states.has('unknown')).toBe(true);
  });
});

describe('evaluateOnboardingEligibility — compliant', () => {
  it('returns compliant when all checks pass', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: true,
      kycCompleted: true,
      alreadyOnboarded: false,
      serviceAvailable: true,
    });
    expect(r.state).toBe('compliant');
    expect(r.title).toBe('Eligible to onboard');
  });

  it('returns compliant with "Already onboarded" when already onboarded', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: true,
      kycCompleted: true,
      alreadyOnboarded: true,
      serviceAvailable: true,
    });
    expect(r.state).toBe('compliant');
    expect(r.title).toBe('Already onboarded');
    expect(r.hint).toMatch(/portfolio/i);
  });
});

describe('evaluateOnboardingEligibility — blocked', () => {
  it('blocks when wallet is on unsupported network', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: false,
      kycCompleted: true,
      alreadyOnboarded: false,
      serviceAvailable: true,
    });
    expect(r.state).toBe('blocked');
    expect(r.message).toMatch(/network/i);
  });

  it('blocks when KYC is not completed', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: true,
      kycCompleted: false,
      alreadyOnboarded: false,
      serviceAvailable: true,
    });
    expect(r.state).toBe('blocked');
    expect(r.title).toBe('KYC required');
  });
});

describe('evaluateOnboardingEligibility — unknown (no overclaiming)', () => {
  it('returns unknown when service is unavailable', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: true,
      kycCompleted: true,
      alreadyOnboarded: false,
      serviceAvailable: false,
    });
    expect(r.state).toBe('unknown');
  });

  it('returns unknown when KYC status is unknown', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: true,
      // kycCompleted omitted
      alreadyOnboarded: false,
      serviceAvailable: true,
    });
    expect(r.state).toBe('unknown');
  });

  it('unknown copy avoids confirming allow/block', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: true,
      kycCompleted: true,
      alreadyOnboarded: false,
      serviceAvailable: false,
    });
    expect(r.message).toMatch(/not a confirmation|allowed or blocked/i);
  });
});

describe('evaluateOnboardingEligibility — precedence', () => {
  it('service-down wins over everything (fail-closed)', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: false,
      kycCompleted: false,
      alreadyOnboarded: false,
      serviceAvailable: false,
    });
    expect(r.state).toBe('unknown');
  });

  it('network block beats KYC block', () => {
    const r = evaluateOnboardingEligibility({
      walletOnSupportedNetwork: false,
      kycCompleted: false,
      alreadyOnboarded: false,
      serviceAvailable: true,
    });
    expect(r.state).toBe('blocked');
    expect(r.message).toMatch(/network/i);
  });
});

describe('onboarding fixture coverage', () => {
  it('covers all major states across the onboarding fixture set', () => {
    const states = new Set(
      [ONBOARDING_COMPLIANT, ONBOARDING_BLOCKED_NETWORK, ONBOARDING_BLOCKED_KYC, ONBOARDING_UNKNOWN_SERVICE_DOWN]
        .map((f) => evaluateOnboardingEligibility(f).state),
    );
    expect(states.has('compliant')).toBe(true);
    expect(states.has('blocked')).toBe(true);
    expect(states.has('unknown')).toBe(true);
  });
});
