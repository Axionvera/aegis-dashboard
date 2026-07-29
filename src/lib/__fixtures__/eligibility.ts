import type { EligibilityInput, OnboardingEligibilityInput } from '../eligibility';

// Representative inputs covering the major eligibility states (issue #55).
// Used by unit tests and as sample data for the panel.

export const FIXTURE_COMPLIANT_SEND: EligibilityInput = {
  direction: 'send',
  walletCompliant: true,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: true,
};

export const FIXTURE_COMPLIANT_RECEIVE: EligibilityInput = {
  direction: 'receive',
  walletCompliant: true,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: true,
};

export const FIXTURE_BLOCKED_WALLET_KYC: EligibilityInput = {
  direction: 'send',
  walletCompliant: false,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: true,
};

export const FIXTURE_BLOCKED_NETWORK: EligibilityInput = {
  direction: 'send',
  walletCompliant: true,
  walletOnSupportedNetwork: false,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: true,
};

export const FIXTURE_BLOCKED_ASSET: EligibilityInput = {
  direction: 'receive',
  walletCompliant: true,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'BND', compliant: false, reason: 'This bond is restricted to accredited investors only.' },
  serviceAvailable: true,
};

export const FIXTURE_UNAVAILABLE_PAUSED: EligibilityInput = {
  direction: 'send',
  walletCompliant: true,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true, assetPaused: true },
  serviceAvailable: true,
};

export const FIXTURE_UNKNOWN_SERVICE_DOWN: EligibilityInput = {
  direction: 'send',
  walletCompliant: true,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: false,
};

export const FIXTURE_UNKNOWN_PARTIAL: EligibilityInput = {
  direction: 'send',
  // walletCompliant omitted -> unknown
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: true,
};

export const ALL_FIXTURES: EligibilityInput[] = [
  FIXTURE_COMPLIANT_SEND,
  FIXTURE_COMPLIANT_RECEIVE,
  FIXTURE_BLOCKED_WALLET_KYC,
  FIXTURE_BLOCKED_NETWORK,
  FIXTURE_BLOCKED_ASSET,
  FIXTURE_UNAVAILABLE_PAUSED,
  FIXTURE_UNKNOWN_SERVICE_DOWN,
  FIXTURE_UNKNOWN_PARTIAL,
];

// ── Onboarding Eligibility Fixtures ──

export const ONBOARDING_COMPLIANT: OnboardingEligibilityInput = {
  walletOnSupportedNetwork: true,
  kycCompleted: true,
  alreadyOnboarded: false,
  serviceAvailable: true,
};

export const ONBOARDING_ALREADY_ONBOARDED: OnboardingEligibilityInput = {
  walletOnSupportedNetwork: true,
  kycCompleted: true,
  alreadyOnboarded: true,
  serviceAvailable: true,
};

export const ONBOARDING_BLOCKED_NETWORK: OnboardingEligibilityInput = {
  walletOnSupportedNetwork: false,
  kycCompleted: true,
  alreadyOnboarded: false,
  serviceAvailable: true,
};

export const ONBOARDING_BLOCKED_KYC: OnboardingEligibilityInput = {
  walletOnSupportedNetwork: true,
  kycCompleted: false,
  alreadyOnboarded: false,
  serviceAvailable: true,
};

export const ONBOARDING_UNKNOWN_SERVICE_DOWN: OnboardingEligibilityInput = {
  walletOnSupportedNetwork: true,
  kycCompleted: true,
  alreadyOnboarded: false,
  serviceAvailable: false,
};

export const ONBOARDING_UNKNOWN_PARTIAL: OnboardingEligibilityInput = {
  walletOnSupportedNetwork: true,
  // kycCompleted omitted -> unknown
  alreadyOnboarded: false,
  serviceAvailable: true,
};

export const ALL_ONBOARDING_FIXTURES: OnboardingEligibilityInput[] = [
  ONBOARDING_COMPLIANT,
  ONBOARDING_ALREADY_ONBOARDED,
  ONBOARDING_BLOCKED_NETWORK,
  ONBOARDING_BLOCKED_KYC,
  ONBOARDING_UNKNOWN_SERVICE_DOWN,
  ONBOARDING_UNKNOWN_PARTIAL,
];
