import type { PortfolioAsset, PortfolioReadModel } from './types';

/**
 * Stand-in for `@aegis/sdk`. The real SDK is not published to this
 * repository yet (see docs/investor-dashboard.md), so this module mimics
 * its expected read-model shape and latency so the rest of the app can be
 * built against a stable contract. Swap the bodies of these functions for
 * real SDK calls once the package is available — nothing outside this file
 * should need to change.
 */

const MOCK_LATENCY_MS = 700;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildMockPortfolio(investorAddress: string): PortfolioAsset[] {
  return [
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
        description: 'Fractionalized ownership record in a Manhattan commercial property, tokenized under Aegis protocol rules.',
      },
      compliance: {
        state: 'compliant',
        label: 'Compliant',
        detail: 'Investor KYC and accreditation checks are current for this asset class.',
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
      balance: 10000.0,
      decimals: 2,
      metadata: {
        assetClass: 'Fixed Income',
        issuer: 'Aegis Treasury Desk',
        jurisdiction: 'United States',
        description: 'Tokenized record tracking a 6-month US Treasury Bill position held in custody.',
      },
      compliance: {
        state: 'compliant',
        label: 'Compliant',
        detail: 'Investor KYC and accreditation checks are current for this asset class.',
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
      balance: 1250.0,
      decimals: 2,
      metadata: {
        assetClass: 'Private Credit',
        issuer: 'Aegis European Holdings GmbH',
        jurisdiction: 'European Union',
        description: 'Tokenized interest in a logistics-sector private credit fund.',
      },
      compliance: {
        state: 'restricted',
        label: 'Restricted',
        detail: 'This asset class requires an EU investor accreditation record on file, which was not found for this address.',
      },
      transferEligibility: {
        state: 'ineligible',
        reasons: ['Investor accreditation for EU private credit offerings is not on file.'],
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
        detail: 'The compliance registry did not return a record for this asset in time.',
      },
      transferEligibility: {
        state: 'unknown',
        reasons: ['Compliance status could not be verified from the SDK read model.'],
      },
      isDataAvailable: false,
    },
  ];
}

/**
 * Fetches the investor's compliant-holdings read model. Mirrors the shape
 * expected from `AegisClient.portfolio.get(address)` in the real SDK.
 */
export async function getPortfolio(investorAddress: string): Promise<PortfolioReadModel> {
  if (!investorAddress) {
    throw new Error('An investor address is required to load a portfolio.');
  }

  await wait(MOCK_LATENCY_MS);

  return {
    investorAddress,
    assets: buildMockPortfolio(investorAddress),
    fetchedAt: new Date().toISOString(),
  };
}

/** Mocks checking whether a recipient address is KYC whitelisted. */
export async function checkWhitelist(address: string): Promise<boolean> {
  await wait(800);
  return address.startsWith('G') && address.length > 50;
}

/** Mocks a compliant asset transfer. */
export async function transfer(to: string, amount: number): Promise<string> {
  await wait(1500);
  void to;
  void amount;
  return 'mock_tx_hash_1234567890';
}

/** Mocks an admin mint action. */
export async function mint(to: string, amount: number): Promise<string> {
  await wait(1500);
  void to;
  void amount;
  return 'mock_tx_hash_0987654321';
}
