/**
 * Fixtures / mock data for the asset registration flow.
 *
 * Import these in development to pre-fill the form and speed up iteration.
 * Never import fixtures in production code paths.
 */

import type { AssetMetadata } from '@/lib/validateAssetMetadata';

export const ASSET_TYPE_OPTIONS = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'treasury', label: 'Government Treasury' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'other', label: 'Other' },
] as const;

/** A pre-filled real-estate registration for local development */
export const FIXTURE_REAL_ESTATE: AssetMetadata = {
  name: 'Manhattan Commercial Real Estate',
  ticker: 'NY-CRE',
  assetType: 'real_estate',
  totalSupply: '10000',
  documentUri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  jurisdiction: 'US',
  description:
    'Fractional ownership of a commercial office tower located in Midtown Manhattan. ' +
    'The underlying property is managed by Aegis Real Estate Partners LLC.',
};

/** A pre-filled treasury bill registration for local development */
export const FIXTURE_TREASURY: AssetMetadata = {
  name: 'US Treasury Bill 6-Month',
  ticker: 'UST-6M',
  assetType: 'treasury',
  totalSupply: '500000',
  documentUri: 'https://aegis-docs.example.com/assets/ust-6m-prospectus.pdf',
  jurisdiction: 'US',
  description: 'Tokenized 6-month US Treasury Bill with automatic maturity settlement.',
};
