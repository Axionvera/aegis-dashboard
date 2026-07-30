import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvestorPortfolioTable from './InvestorPortfolioTable';
import type { PortfolioAsset } from '@/lib/aegis/types';

function makeAsset(overrides: Partial<PortfolioAsset> = {}): PortfolioAsset {
  return {
    id: 'ny-cre',
    name: 'Manhattan Commercial Real Estate',
    ticker: 'NY-CRE',
    balance: 50.5,
    decimals: 2,
    metadata: {
      assetClass: 'Real Estate',
      issuer: 'Aegis Property Holdings LLC',
      jurisdiction: 'United States',
      description: 'Fractionalized ownership record.',
    },
    compliance: {
      state: 'compliant',
      label: 'Compliant',
      detail: 'KYC current.',
    },
    transferEligibility: {
      state: 'eligible',
      reasons: [],
    },
    lifecycleStatus: {
      current: 'active',
      since: '2026-01-15T00:00:00Z',
      history: [{ state: 'active', occurredAt: '2026-01-15T00:00:00Z' }],
    },
    isDataAvailable: true,
    ...overrides,
  };
}

describe('InvestorPortfolioTable', () => {
  it('renders asset cards when assets are available', () => {
    render(
      <InvestorPortfolioTable assets={[makeAsset()]} onTransferClick={vi.fn()} />,
    );
    expect(screen.getByText('Manhattan Commercial Real Estate')).toBeInTheDocument();
    expect(screen.getByText('NY-CRE')).toBeInTheDocument();
  });

  it('shows empty state when no assets are available', () => {
    render(
      <InvestorPortfolioTable assets={[]} onTransferClick={vi.fn()} />,
    );
    expect(screen.getByText('No holdings yet')).toBeInTheDocument();
  });

  it('shows restricted compliance badge for restricted assets', () => {
    const restricted = makeAsset({
      id: 'restricted-1',
      compliance: {
        state: 'restricted',
        label: 'Restricted',
        detail: 'Accreditation required.',
      },
      transferEligibility: {
        state: 'ineligible',
        reasons: ['Restricted to accredited investors only.'],
      },
    });
    render(
      <InvestorPortfolioTable assets={[restricted]} onTransferClick={vi.fn()} />,
    );
    expect(screen.getByText('Restricted')).toBeInTheDocument();
    expect(screen.getByText('Transfer restricted')).toBeInTheDocument();
  });

  it('shows unavailable section for assets with missing metadata', () => {
    const unavailable = makeAsset({
      id: 'unavail-1',
      name: 'Unknown Asset',
      ticker: 'UNK',
      isDataAvailable: false,
    });
    render(
      <InvestorPortfolioTable assets={[unavailable]} onTransferClick={vi.fn()} />,
    );
    expect(screen.getByText('Unavailable holdings (1)')).toBeInTheDocument();
    expect(screen.getByText('Metadata temporarily unavailable')).toBeInTheDocument();
  });

  it('calls onTransferClick when transfer button is clicked', () => {
    const onTransferClick = vi.fn();
    render(
      <InvestorPortfolioTable assets={[makeAsset()]} onTransferClick={onTransferClick} />,
    );
    screen.getByText('Transfer').click();
    expect(onTransferClick).toHaveBeenCalledTimes(1);
  });
});
