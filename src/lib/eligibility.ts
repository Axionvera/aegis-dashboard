// Transfer eligibility engine for investor-facing restricted assets.
//
// Issue #55: explain whether a user can send/receive a restricted asset,
// based on compliance, asset status, wallet network, and availability.
//
// IMPORTANT (per issue + compliance): this module is informational. It never
// makes a legal determination and the copy must avoid overclaiming. The
// authoritative result is whatever the on-chain contract / SDK returns; this
// engine only surfaces a human-readable explanation of likely states.

export type EligibilityState = 'compliant' | 'blocked' | 'unknown' | 'unavailable';

export type TransferDirection = 'send' | 'receive';

export interface AssetRestriction {
  /** Ticker symbol, e.g. "AEG" — used for asset-specific messaging. */
  ticker: string;
  /** True when the asset is globally paused / not tradable on the platform. */
  assetPaused?: boolean;
  /** Per-jurisdiction or per-asset compliance flag (e.g. KYC/accreditation). */
  compliant?: boolean;
  /** Free-form reason when a restriction is known. */
  reason?: string;
}

export interface EligibilityInput {
  /** The direction of the transfer being evaluated. */
  direction: TransferDirection;
  /** Wallet KYC / whitelist status, when known. */
  walletCompliant?: boolean;
  /** Wallet connected to a supported network? */
  walletOnSupportedNetwork?: boolean;
  /** Asset-level restriction info, when available. */
  asset?: AssetRestriction;
  /**
   * Backend / SDK availability. When false we cannot determine eligibility,
   * so we must not claim either compliance or block.
   */
  serviceAvailable?: boolean;
}

export interface EligibilityResult {
  state: EligibilityState;
  /** Short headline shown in the panel badge. */
  title: string;
  /** Plain-language explanation. Avoids legal overclaiming. */
  message: string;
  /** Actionable, non-legal guidance for the investor. */
  hint?: string;
  /** Whether asset-specific restrictions contributed to the result. */
  assetSpecific: boolean;
}

const UNKNOWN_MESSAGE =
  'We could not verify transfer eligibility right now. This is not a confirmation that the transfer is allowed or blocked.';

function compliantResult(direction: TransferDirection, asset: AssetRestriction | undefined): EligibilityResult {
  const assetLine = asset ? ` for ${asset.ticker}` : '';
  const verb = direction === 'send' ? 'send' : 'receive';
  return {
    state: 'compliant',
    title: 'Eligible',
    message: `Based on the information available, this wallet appears able to ${verb}${assetLine} at this time. Final approval is decided on-chain at transfer.`,
    hint: 'Always confirm the on-chain result before relying on this.',
    assetSpecific: Boolean(asset),
  };
}

function blockedResult(reason: string, assetSpecific: boolean, hint?: string): EligibilityResult {
  return {
    state: 'blocked',
    title: 'Not eligible',
    message: reason,
    hint: hint ?? 'Contact support or complete any required steps before retrying.',
    assetSpecific,
  };
}

function unavailableResult(): EligibilityResult {
  return {
    state: 'unavailable',
    title: 'Temporarily unavailable',
    message:
      'Transfers for this asset are temporarily unavailable (e.g. paused or maintenance). This does not mean your wallet is blocked.',
    hint: 'Try again later or check asset status.',
    assetSpecific: true,
  };
}

/**
 * Evaluate transfer eligibility for a single direction.
 *
 * Order of checks (fail-closed on doubt):
 *  1. service unavailable  -> 'unavailable' (never claim compliant/blocked)
 *  2. asset paused         -> 'unavailable'
 *  3. wallet off-network   -> 'blocked' (network mismatch)
 *  4. asset non-compliant  -> 'blocked' (asset-specific)
 *  5. wallet non-compliant -> 'blocked' (compliance)
 *  6. unknown compliance   -> 'unknown' (no overclaiming)
 *  7. otherwise            -> 'compliant'
 */
export function evaluateEligibility(input: EligibilityInput): EligibilityResult {
  const { direction, walletCompliant, walletOnSupportedNetwork, asset, serviceAvailable = true } = input;

  if (!serviceAvailable) {
    return { state: 'unknown', title: 'Status unknown', message: UNKNOWN_MESSAGE, assetSpecific: Boolean(asset) };
  }

  if (asset?.assetPaused) {
    return unavailableResult();
  }

  if (walletOnSupportedNetwork === false) {
    return blockedResult(
      'Your wallet is connected to a network this asset does not support. Switch to a supported network to continue.',
      Boolean(asset),
      'Check your wallet network settings.',
    );
  }

  if (asset && asset.compliant === false) {
    const reason = asset.reason ?? `This asset (${asset.ticker}) is not available to this wallet under current compliance rules.`;
    return blockedResult(reason, true);
  }

  if (walletCompliant === false) {
    return blockedResult(
      'This wallet has not completed the required compliance checks (e.g. KYC) for this transfer.',
      Boolean(asset),
      'Complete compliance verification, then try again.',
    );
  }

  if (walletCompliant === undefined || (asset && asset.compliant === undefined)) {
    return {
      state: 'unknown',
      title: 'Status unknown',
      message: UNKNOWN_MESSAGE,
      assetSpecific: Boolean(asset),
    };
  }

  return compliantResult(direction, asset);
}

/** Convenience: evaluate both directions at once. */
export function evaluateBothDirections(input: Omit<EligibilityInput, 'direction'>): {
  send: EligibilityResult;
  receive: EligibilityResult;
} {
  return {
    send: evaluateEligibility({ ...input, direction: 'send' }),
    receive: evaluateEligibility({ ...input, direction: 'receive' }),
  };
}

export const STATE_ORDER: EligibilityState[] = ['compliant', 'blocked', 'unknown', 'unavailable'];
