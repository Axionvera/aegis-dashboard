/**
 * src/fixtures/portfolio.ts
 *
 * Mock portfolio fixture for local development.
 *
 * These assets are entirely synthetic — addresses, balances, and compliance
 * statuses are illustrative only and bear no relation to real accounts or
 * on-chain state. They are designed to exercise every UI state the portfolio
 * view can render (compliant, restricted, pending review, data unavailable).
 *
 * Consumed by: src/lib/sdk/MockAegisProvider.ts
 */

import type { PortfolioReadModel } from '@/lib/aegis/types';

export const mockPortfolioFixture: Omit<PortfolioReadModel, 'investorAddress' | 'fetchedAt'> = {
  assets: [
    {
      id: 'ny-cre',
      name: 'Manhattan Commercial Real Estate',
      ticker: 'NY-CRE',
      balance: 50.5,
      decimals: 2,
      metadata: {
        assetClass: 'Real Estate',
        issuer: 'Aegis Property Holdings LLC',
        jurisdiction: 'United States',
        description:
          'Fractionalized ownership record in a Manhattan commercial property, tokenized under Aegis protocol rules.',
      },
      compliance: {
        state: 'compliant',
        label: 'Compliant',
        detail:
          'Investor KYC and accreditation checks are current for this asset class.',
      },
      transferEligibility: {
        state: 'eligible',
        reasons: [],
      },
      isDataAvailable: true,
    },
    {
      id: 'ust-6m',
      name: 'US Treasury Bill 6-Mo',
      ticker: 'UST-6M',
      balance: 10_000.0,
      decimals: 2,
      metadata: {
        assetClass: 'Fixed Income',
        issuer: 'Aegis Treasury Desk',
        jurisdiction: 'United States',
        description:
          'Tokenized record tracking a 6-month US Treasury Bill position held in custody.',
      },
      compliance: {
        state: 'compliant',
        label: 'Compliant',
        detail:
          'Investor KYC and accreditation checks are current for this asset class.',
      },
      transferEligibility: {
        state: 'eligible',
        reasons: [],
      },
      isDataAvailable: true,
    },
    {
      id: 'fr-log',
      name: 'Frankfurt Logistics Fund',
      ticker: 'FR-LOG',
      balance: 1_250.0,
      decimals: 2,
      metadata: {
        assetClass: 'Private Credit',
        issuer: 'Aegis European Holdings GmbH',
        jurisdiction: 'European Union',
        description:
          'Tokenized interest in a logistics-sector private credit fund.',
      },
      compliance: {
        state: 'restricted',
        label: 'Restricted',
        detail:
          'This asset class requires an EU investor accreditation record on file, which was not found for this address.',
      },
      transferEligibility: {
        state: 'ineligible',
        reasons: [
          'Investor accreditation for EU private credit offerings is not on file.',
        ],
      },
      isDataAvailable: true,
    },
    {
      id: 'sg-pcn',
      name: 'Singapore Private Credit Note',
      ticker: 'SG-PCN',
      balance: 300.0,
      decimals: 2,
      metadata: {
        assetClass: 'Private Credit',
        issuer: 'Unknown',
        jurisdiction: 'Unknown',
        description: '',
      },
      compliance: {
        state: 'pending_review',
        label: 'Pending Review',
        detail:
          'The compliance registry did not return a record for this asset in time.',
      },
      transferEligibility: {
        state: 'unknown',
        reasons: [
          'Compliance status could not be verified from the SDK read model.',
        ],
      },
      isDataAvailable: false,
    },
  ],
};
