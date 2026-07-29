/**
 * Mintable RWA asset fixtures for the admin minting workflow.
 *
 * These describe assets an admin may select when issuing new supply.
 * They are synthetic and for UI / mock-mode use only — not live on-chain
 * registry data.
 */

export interface MintableAsset {
  id: string;
  name: string;
  ticker: string;
  decimals: number;
  assetClass: string;
  /** Short label shown in the asset selector. */
  description: string;
}

export const mintableAssetsFixture: MintableAsset[] = [
  {
    id: 'ny-cre',
    name: 'Manhattan Commercial Real Estate',
    ticker: 'NY-CRE',
    decimals: 2,
    assetClass: 'Real Estate',
    description: 'Fractionalized Manhattan commercial property.',
  },
  {
    id: 'ust-6m',
    name: 'US Treasury Bill 6-Mo',
    ticker: 'UST-6M',
    decimals: 2,
    assetClass: 'Fixed Income',
    description: 'Tokenized 6-month US Treasury Bill position.',
  },
  {
    id: 'eu-infra',
    name: 'EU Infrastructure Bond',
    ticker: 'EU-INFRA',
    decimals: 7,
    assetClass: 'Fixed Income',
    description: 'Tokenized European infrastructure debt instrument.',
  },
];

export function findMintableAsset(assetId: string): MintableAsset | undefined {
  return mintableAssetsFixture.find((asset) => asset.id === assetId);
}
