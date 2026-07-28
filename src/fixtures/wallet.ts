/**
 * Wallet state fixtures for testing wallet connection, disconnection,
 * and edge-case scenarios.
 *
 * All addresses use non-real Stellar public key patterns.
 * Never use actual wallet addresses or private keys in fixtures.
 */

export interface WalletFixture {
  address: string
  network: string
}

/** A connected wallet on testnet. */
export const walletConnectedTestnet: WalletFixture = {
  address: 'GALACTIC-TEST-NET-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFG',
  network: 'Test SDF Network ; September 2015',
}

/** A connected wallet on mainnet. */
export const walletConnectedMainnet: WalletFixture = {
  address: 'GALACTIC-MAIN-NET-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEFGHIJ',
  network: 'Public Global Stellar Network ; September 2015',
}

/** Wallet state: not connected. */
export const walletDisconnected = {
  address: null,
  network: null,
}

/** Wallet state: connection in progress. */
export const walletConnecting = {
  address: null,
  network: null,
  isConnecting: true,
}

/** Wallet state: connected but on an unexpected network. */
export const walletUnknownNetwork: WalletFixture = {
  address: 'GALACTIC-UNKNOWN-NETWORK-ADDRESS-FOR-FIXTURE-ONLY-1234567890ABCDEF',
  network: 'Unknown Custom Network',
}

/** Edge case: very long address string. */
export const walletLongAddress: WalletFixture = {
  address: 'G'.padEnd(100, 'A') + 'FIXTURE',
  network: 'Test SDF Network ; September 2015',
}

/** Edge case: address with special characters. */
export const walletSpecialCharsAddress: WalletFixture = {
  address: 'G<script>alert(1)</script>',
  network: 'Test SDF Network ; September 2015',
}
