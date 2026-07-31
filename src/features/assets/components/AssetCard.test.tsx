import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AssetCard from './AssetCard';
import type { PortfolioAsset } from '@/lib/aegis/types';

const asset: PortfolioAsset = {
  id: 'asset-1',
  name: 'Example Bond',
  ticker: 'BND',
  balance: 1250,
  decimals: 7,
  metadata: {
    assetClass: 'Private Credit',
    issuer: 'Example Issuer',
    jurisdiction: 'US',
    description: 'Example bond',
  },
  compliance: {
    state: 'restricted',
    label: 'Restricted',
    detail: 'This asset has transfer restrictions.',
  },
  transferEligibility: {
    state: 'ineligible',
    reasons: ['Restricted to accredited investors only.'],
  },
  isDataAvailable: true,
};

describe('AssetCard', () => {
  it('shows a transfer restriction explainer when the asset is not eligible', () => {
    render(<AssetCard asset={asset} onTransferClick={() => {}} />);

    expect(screen.getByText(/Transfer eligibility/i)).toBeInTheDocument();
    expect(screen.getByText('Not eligible')).toBeInTheDocument();
  });
});
