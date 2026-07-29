/**
 * EnvironmentBanner
 *
 * Always-visible strip that shows which network and contract the dashboard
 * is currently pointed at (Issue #8). This is distinct from:
 * - MockModeBanner, which only renders when mock mode is active, and
 * - EnvironmentMismatchScreen, which blocks on a *wallet* network mismatch.
 *
 * EnvironmentBanner renders unconditionally (outside of mock mode) so a user
 * can tell which environment they're in at a glance, even before connecting
 * a wallet. Mainnet gets a visually distinct, harder-to-miss treatment since
 * real funds are at stake there.
 */

import { getTargetNetwork, formatNetworkLabel } from '@/lib/environment';
import { redactContractId } from '@/lib/diagnostics/redact';
import { isMockModeEnabled } from '@/config/mockMode';

const MAINNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015';

export default function EnvironmentBanner() {
  // Mock mode has its own, more prominent banner — avoid showing both.
  if (isMockModeEnabled()) return null;

  const passphrase = getTargetNetwork();
  const label = formatNetworkLabel(passphrase);
  const contractId = process.env.NEXT_PUBLIC_AEGIS_CONTRACT_ID;
  const isMainnet = passphrase === MAINNET_PASSPHRASE;

  return (
    <div
      role="status"
      className={
        isMainnet
          ? 'flex items-center justify-center gap-2 bg-red-600 px-4 py-1.5 text-xs font-semibold text-white'
          : 'flex items-center justify-center gap-2 bg-slate-700 px-4 py-1.5 text-xs font-medium text-slate-100'
      }
    >
      <span>{isMainnet ? 'LIVE MAINNET' : label}</span>
      <span aria-hidden="true" className="opacity-60">
        •
      </span>
      <span className="font-mono">{redactContractId(contractId)}</span>
    </div>
  );
}