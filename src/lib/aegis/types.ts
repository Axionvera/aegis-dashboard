/**
 * Shared shapes for data returned by the Aegis SDK's portfolio read model.
 * Kept separate from UI components so the same types can back the mock
 * client today and a real `@aegis/sdk` integration later without touching
 * the components that consume them.
 */

import type { AssetLifecycleStatus } from '../assetLifecycle';

export type ComplianceState = 'compliant' | 'restricted' | 'pending_review';

export interface ComplianceStatus {
  state: ComplianceState;
  /** Short label for badges, e.g. "Compliant", "Restricted". */
  label: string;
  /** Longer explanation surfaced in tooltips/detail views. */
  detail: string;
}

export type TransferEligibilityState = 'eligible' | 'ineligible' | 'unknown';

export interface TransferEligibility {
  state: TransferEligibilityState;
  /** Human-readable reasons a transfer is blocked; empty when eligible. */
  reasons: string[];
}

export interface AssetMetadata {
  assetClass: string;
  issuer: string;
  jurisdiction: string;
  description: string;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  ticker: string;
  balance: number;
  decimals: number;
  metadata: AssetMetadata;
  compliance: ComplianceStatus;
  transferEligibility: TransferEligibility;
  /**
   * Issuer-controlled operational stage of this already-minted asset
   * (active/paused/matured/redeemed/defaulted). Optional and omitted when
   * the SDK could not resolve it — callers must not assume 'active' by
   * default in that case. See src/lib/assetLifecycle.ts.
   */
  lifecycleStatus?: AssetLifecycleStatus;
  /**
   * False when the SDK could resolve the on-chain balance but not the
   * off-chain metadata/compliance record for this asset. The UI must still
   * render the holding, but as an "unavailable" state rather than guessing.
   */
  isDataAvailable: boolean;
}

export interface PortfolioReadModel {
  investorAddress: string;
  assets: PortfolioAsset[];
  fetchedAt: string;
}