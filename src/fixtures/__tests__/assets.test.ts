import {
  assetCommercialRealEstate,
  assetTreasuryBill,
  assetZeroBalance,
  assetLargeBalance,
  assetFractional,
  defaultPortfolioAssets,
} from '@/fixtures'

describe('Asset fixtures', () => {
  it('commercial real estate has positive balance', () => {
    expect(assetCommercialRealEstate.balance).toBeGreaterThan(0)
    expect(assetCommercialRealEstate.ticker).toBeTruthy()
    expect(assetCommercialRealEstate.name).toBeTruthy()
  })

  it('treasury bill has round balance', () => {
    expect(assetTreasuryBill.balance).toBe(10000)
  })

  it('zero balance asset has balance of 0', () => {
    expect(assetZeroBalance.balance).toBe(0)
  })

  it('large balance asset handles big numbers', () => {
    expect(assetLargeBalance.balance).toBeGreaterThan(999_999_999)
  })

  it('fractional asset has small decimal balance', () => {
    expect(assetFractional.balance).toBeLessThan(1)
    expect(assetFractional.balance).toBeGreaterThan(0)
  })

  it('default portfolio has 2 assets', () => {
    expect(defaultPortfolioAssets).toHaveLength(2)
  })

  it('all assets have unique ids', () => {
    const ids = defaultPortfolioAssets.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all assets have unique tickers', () => {
    const tickers = defaultPortfolioAssets.map((a) => a.ticker)
    expect(new Set(tickers).size).toBe(tickers.length)
  })
})
