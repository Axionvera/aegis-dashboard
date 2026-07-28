/**
 * Builds links to stellar.expert for a submitted transaction.
 */

const EXPLORER_BASE = 'https://stellar.expert/explorer';

/**
 * Maps the network names Freighter can report onto stellar.expert path
 * segments. Anything not listed has no explorer we can link to.
 */
const NETWORK_SEGMENTS: Record<string, string> = {
  public: 'public',
  pubnet: 'public',
  mainnet: 'public',
  testnet: 'testnet',
};

/**
 * Returns the explorer URL for a transaction hash, or `null` when we can't
 * build a link we trust (no hash yet, or an unsupported network). Callers pass
 * the result straight to `TransactionReceipt`, which hides the link when null.
 */
export const getExplorerUrl = (
  txHash: string | null | undefined,
  network: string | null | undefined,
): string | null => {
  const hash = txHash?.trim();
  if (!hash) return null;

  const segment = NETWORK_SEGMENTS[(network ?? '').trim().toLowerCase()];
  if (!segment) return null;

  return `${EXPLORER_BASE}/${segment}/tx/${encodeURIComponent(hash)}`;
};
