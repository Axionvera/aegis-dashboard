import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OnboardingEligibilityPanel from '@/features/investor/OnboardingEligibilityPanel';

const BASE = {
  walletOnSupportedNetwork: true,
  kycCompleted: true,
  alreadyOnboarded: false,
  serviceAvailable: true,
};

describe('OnboardingEligibilityPanel', () => {
  it('renders the result message', () => {
    render(<OnboardingEligibilityPanel input={BASE} />);
    expect(screen.getByText(/appears eligible to onboard/i)).toBeInTheDocument();
  });

  it('shows "Eligible to onboard" badge when compliant', () => {
    render(<OnboardingEligibilityPanel input={BASE} />);
    expect(screen.getByText('Eligible to onboard')).toBeInTheDocument();
  });

  it('shows "Already onboarded" when wallet is already onboarded', () => {
    render(
      <OnboardingEligibilityPanel
        input={{ ...BASE, alreadyOnboarded: true }}
      />,
    );
    expect(screen.getByText('Already onboarded')).toBeInTheDocument();
    expect(screen.getByText(/already recognized/i)).toBeInTheDocument();
  });

  it('shows "Network mismatch" when wallet is on unsupported network', () => {
    render(
      <OnboardingEligibilityPanel
        input={{ ...BASE, walletOnSupportedNetwork: false }}
      />,
    );
    expect(screen.getByText('Network mismatch')).toBeInTheDocument();
    expect(screen.getByText(/your wallet is connected to a network/i)).toBeInTheDocument();
  });

  it('shows "KYC required" when KYC is not completed', () => {
    render(
      <OnboardingEligibilityPanel
        input={{ ...BASE, kycCompleted: false }}
      />,
    );
    expect(screen.getByText('KYC required')).toBeInTheDocument();
  });

  it('shows "Status unknown" when service is unavailable', () => {
    render(
      <OnboardingEligibilityPanel
        input={{ ...BASE, serviceAvailable: false }}
      />,
    );
    expect(screen.getByText('Status unknown')).toBeInTheDocument();
    expect(screen.getByText(/not a confirmation/i)).toBeInTheDocument();
  });

  it('shows the compliance disclaimer', () => {
    render(<OnboardingEligibilityPanel input={BASE} />);
    expect(screen.getByText(/protocol-level compliance/i)).toBeInTheDocument();
  });

  it('includes the section with correct aria-label', () => {
    render(<OnboardingEligibilityPanel input={BASE} />);
    expect(screen.getByLabelText('Onboarding eligibility')).toBeInTheDocument();
  });
});
