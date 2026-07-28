import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvestorEligibilityPanel from '@/features/investor/InvestorEligibilityPanel';

const BASE = {
  walletCompliant: true,
  walletOnSupportedNetwork: true,
  asset: { ticker: 'AEG', compliant: true },
  serviceAvailable: true,
};

describe('InvestorEligibilityPanel', () => {
  it('renders both send and receive rows', () => {
    render(<InvestorEligibilityPanel input={BASE} />);
    expect(screen.getByText('Send')).toBeInTheDocument();
    expect(screen.getByText('Receive')).toBeInTheDocument();
  });

  it('shows "Eligible" badges when compliant', () => {
    render(<InvestorEligibilityPanel input={BASE} />);
    const badges = screen.getAllByText('Eligible');
    expect(badges.length).toBe(2);
  });

  it('shows blocked state with asset-specific reason', () => {
    render(
      <InvestorEligibilityPanel
        input={{
          walletCompliant: true,
          walletOnSupportedNetwork: true,
          asset: { ticker: 'BND', compliant: false, reason: 'Restricted to accredited investors only.' },
          serviceAvailable: true,
        }}
      />,
    );
    expect(screen.getAllByText('Not eligible').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/accredited investors/i).length).toBeGreaterThan(0);
  });

  it('shows unavailable when asset is paused', () => {
    render(
      <InvestorEligibilityPanel
        input={{
          walletCompliant: true,
          walletOnSupportedNetwork: true,
          asset: { ticker: 'AEG', compliant: true, assetPaused: true },
          serviceAvailable: true,
        }}
      />,
    );
    expect(screen.getAllByText('Temporarily unavailable').length).toBeGreaterThan(0);
  });

  it('shows unknown and avoids overclaiming when service is down', () => {
    render(
      <InvestorEligibilityPanel
        input={{ ...BASE, serviceAvailable: false }}
      />,
    );
    expect(screen.getAllByText('Status unknown').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/not a confirmation/i).length).toBeGreaterThan(0);
  });

  it('includes the asset ticker in the header when provided', () => {
    render(<InvestorEligibilityPanel input={BASE} ticker="AEG" />);
    expect(screen.getByText(/Transfer eligibility · AEG/i)).toBeInTheDocument();
  });
});
