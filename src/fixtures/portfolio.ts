/**
 * Investor portfolio fixtures for testing portfolio display,
 * balance aggregation, and edge cases.
 */

import { AssetFixture } from './assets'

export interface PortfolioFixture {
  address: string
  assets: AssetFixture[]
  totalValueUsd?: number
}

/** A standard investor portfolio with two assets. */
export const portfolioStandard: PortfolioFixture = {
  address: 'GPORTFOLIO-STANDARD--ADDRESS-FOR-FIXTURE-ONLY-1234567890AB',
  assets: [
    { id: '1', name: 'Manhattan Commercial Real Estate', ticker: 'NY-CRE', balance: 50.5 },
    { id: '2', name: 'US Treasury Bill 6-Mo', ticker: 'UST-6M', balance: 10000.0 },
  ],
  totalValueUsd: 1_050_000.0,
}

/** An empty portfolio (new investor, no assets). */
export const portfolioEmpty: PortfolioFixture = {
  address: 'GPORTFOLIO-EMPTY-------ADDRESS-FOR-FIXTURE-ONLY-1234567890AB',
  assets: [],
  totalValueUsd: 0,
}

/** A portfolio with a single asset. */
export const portfolioSingleAsset: PortfolioFixture = {
  address: 'GPORTFOLIO-SINGLE-----ADDRESS-FOR-FIXTURE-ONLY-1234567890AB',
  assets: [
    { id: '1', name: 'Tokenized Gold Reserve', ticker: 'GLD-RSV', balance: 100.0 },
  ],
  totalValueUsd: 200_000.0,
}

/** A portfolio with many assets (stress test for grid layout). */
export const portfolioManyAssets: PortfolioFixture = {
  address: 'GPORTFOLIO-MANY-------ADDRESS-FOR-FIXTURE-ONLY-1234567890AB',
  assets: Array.from({ length: 12 }, (_, i) => ({
    id: `asset-${i + 1}`,
    name: `Test Asset ${i + 1}`,
    ticker: `TST-${String(i + 1).padStart(2, '0')}`,
    balance: (i + 1) * 100,
  })),
}
