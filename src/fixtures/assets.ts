/**
 * Asset metadata fixtures for testing asset display, formatting,
 * and portfolio rendering.
 *
 * Ticker symbols are non-real. Balances are example values.
 */

export interface AssetFixture {
  id: string
  name: string
  ticker: string
  balance: number
  issuer?: string
}

/** A commercial real estate token. */
export const assetCommercialRealEstate: AssetFixture = {
  id: 'asset-1',
  name: 'Manhattan Commercial Real Estate',
  ticker: 'NY-CRE',
  balance: 50.5,
  issuer: 'GASSET-ISSUER-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
}

/** A US Treasury Bill token. */
export const assetTreasuryBill: AssetFixture = {
  id: 'asset-2',
  name: 'US Treasury Bill 6-Mo',
  ticker: 'UST-6M',
  balance: 10000.0,
  issuer: 'GASSET-TBILL-ISSUER-FOR-FIXTURE-ONLY-1234567890AB',
}

/** An asset with zero balance. */
export const assetZeroBalance: AssetFixture = {
  id: 'asset-3',
  name: 'European Green Bond Fund',
  ticker: 'EGB-FND',
  balance: 0,
  issuer: 'GASSET-BOND-ISSUER-FOR-FIXTURE-ONLY-1234567890ABC',
}

/** An asset with very large balance. */
export const assetLargeBalance: AssetFixture = {
  id: 'asset-4',
  name: 'Tokenized Gold Reserve',
  ticker: 'GLD-RSV',
  balance: 999_999_999.99,
  issuer: 'GASSET-GOLD-ISSUER-FOR-FIXTURE-ONLY-1234567890ABC',
}

/** An asset with fractional precision. */
export const assetFractional: AssetFixture = {
  id: 'asset-5',
  name: 'Luxury Wine Collection',
  ticker: 'WINE-01',
  balance: 0.001,
  issuer: 'GASSET-WINE-ISSUER-FOR-FIXTURE-ONLY-1234567890ABC',
}

/** Default portfolio: array of mixed assets. */
export const defaultPortfolioAssets: AssetFixture[] = [
  assetCommercialRealEstate,
  assetTreasuryBill,
]
