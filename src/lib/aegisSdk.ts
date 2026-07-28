/**
 * Centralised Aegis SDK integration for asset registration.
 *
 * All smart-contract calls related to registering a new RWA asset are
 * funnelled through this module so that the rest of the UI stays
 * framework-agnostic and easy to test.
 *
 * NOTE: The Soroban contract client (`@aegis/sdk`) is not yet published.
 * The functions below simulate realistic async behaviour and return shapes
 * that match what the real SDK is expected to expose.  Replace the mock
 * bodies with real invocations once the SDK package is available.
 */

import type { AssetMetadata } from './validateAssetMetadata';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RegisterAssetParams {
  metadata: AssetMetadata;
  /** Stellar public key of the issuer (from Freighter) */
  issuerAddress: string;
}

export interface RegisterAssetResult {
  /** Stellar transaction hash */
  txHash: string;
  /** Soroban-assigned asset contract address */
  assetContractId: string;
  /** Unix timestamp (ms) of the simulated ledger close */
  ledgerTimestamp: number;
}

export interface SdkError {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomHex(len: number): string {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Submits a new RWA asset registration to the Aegis Soroban contract.
 *
 * In production this would:
 *  1. Build a `register_asset` Soroban invocation XDR.
 *  2. Ask Freighter to sign it via `signTransaction()`.
 *  3. Submit the signed XDR to the Stellar Horizon/Soroban RPC.
 *  4. Poll until ledger inclusion and return the result.
 *
 * @throws {SdkError} on simulated contract or network failure.
 */
export async function registerAsset(
  params: RegisterAssetParams
): Promise<RegisterAssetResult> {
  // Simulate network latency + ledger inclusion time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate a ~10 % failure rate so the error UI can be exercised in dev
  if (Math.random() < 0.1) {
    const err: SdkError = {
      code: 'CONTRACT_ERROR',
      message: 'Simulated contract execution failure. Please retry.',
    };
    throw err;
  }

  return {
    txHash: randomHex(64),
    assetContractId: `C${randomHex(55).toUpperCase()}`,
    ledgerTimestamp: Date.now(),
  };
}

/**
 * Checks whether a given ticker is already registered on the protocol.
 * Prevents duplicate token symbols.
 */
export async function isTickerAvailable(ticker: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  // Mock: pretend "USED" is taken
  return ticker.toUpperCase() !== 'USED';
}
