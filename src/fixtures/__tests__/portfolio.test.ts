import {
  portfolioStandard,
  portfolioEmpty,
  portfolioSingleAsset,
  portfolioManyAssets,
} from '@/fixtures'

describe('Portfolio fixtures', () => {
  it('standard portfolio has assets and total value', () => {
    expect(portfolioStandard.assets.length).toBeGreaterThan(0)
    expect(portfolioStandard.totalValueUsd).toBeGreaterThan(0)
  })

  it('empty portfolio has no assets', () => {
    expect(portfolioEmpty.assets).toHaveLength(0)
    expect(portfolioEmpty.totalValueUsd).toBe(0)
  })

  it('single asset portfolio has exactly one asset', () => {
    expect(portfolioSingleAsset.assets).toHaveLength(1)
  })

  it('many assets portfolio has 12 assets', () => {
    expect(portfolioManyAssets.assets).toHaveLength(12)
  })

  it('many assets portfolio has sequential tickers', () => {
    const tickers = portfolioManyAssets.assets.map((a) => a.ticker)
    expect(tickers[0]).toBe('TST-01')
    expect(tickers[11]).toBe('TST-12')
  })

  it('all portfolio addresses start with G', () => {
    const portfolios = [portfolioStandard, portfolioEmpty, portfolioSingleAsset, portfolioManyAssets]
    for (const p of portfolios) {
      expect(p.address.startsWith('G')).toBe(true)
    }
  })
})
