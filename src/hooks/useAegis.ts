import { useState } from 'react';
import { getAegisProvider } from '@/lib/sdk';
import type { PortfolioReadModel } from '@/lib/aegis/types';
import type {
  RawTransactionOutcome,
  TransactionPhase,
} from '@/components/transactions/types';
import { useTransactionHistoryStore } from '@/features/transactions/store';
import { useWallet } from '@/hooks/useWallet';

/** Called as the transaction moves from wallet signature to network submission. */
type PhaseListener = (phase: TransactionPhase) => void;

const mapOutcomeSuccessful = (outcome: RawTransactionOutcome): boolean | undefined => {
  const status = outcome.status?.toUpperCase();
  if (status === 'SUCCESS') return true;
  if (status === 'FAILED') return false;
  if (status === 'PENDING') return undefined;
  return undefined;
};

/**
 * Thin wrapper around the Aegis SDK provider. Delegates every call to the
 * active provider returned by `getAegisProvider()`, which is either
 * MockAegisProvider (when NEXT_PUBLIC_MOCK_MODE=true) or LiveAegisProvider.
 *
 * To add a new SDK operation:
 *  1. Extend IAegisProvider with the new method.
 *  2. Implement it in both MockAegisProvider and LiveAegisProvider.
 *  3. Add a wrapper here that manages isLoading and records the transaction.
 *
 * Do NOT import `@/lib/aegis/client` directly from here — all SDK concerns
 * go through the provider abstraction.
 */
export const useAegis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const addRecord = useTransactionHistoryStore((state) => state.addRecord);
  const { address } = useWallet();
  const actor = address ?? 'unknown-actor';

  const getPortfolio = async (investorAddress: string): Promise<PortfolioReadModel> => {
    setIsLoading(true);
    try {
      return await getAegisProvider().getPortfolio(investorAddress);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWhitelist = async (target: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const isCompliant = await getAegisProvider().checkWhitelist(target);
      addRecord({
        kind: 'contract_event',
        eventType: 'whitelist.check',
        txHash: `tx_check_${Date.now()}`,
        actor,
        target,
        happenedAt: new Date().toISOString(),
        status: isCompliant ? 'ok' : 'reverted',
        notes: isCompliant
          ? 'Recipient passed compliance checks'
          : 'Recipient failed compliance checks',
      });
      return isCompliant;
    } finally {
      setIsLoading(false);
    }
  };

  const transfer = async (
    to: string,
    amount: number,
    onPhase?: PhaseListener,
    assetTicker?: string,
  ): Promise<RawTransactionOutcome> => {
    setIsLoading(true);
    try {
      const outcome = await getAegisProvider().transfer(to, amount, onPhase);
      const txHash = outcome.hash ?? outcome.txHash ?? `tx_transfer_${Date.now()}`;

      addRecord({
        kind: 'sdk_receipt',
        txHash,
        successful: mapOutcomeSuccessful(outcome),
        signer: actor,
        recipient: to,
        createdAt: new Date().toISOString(),
        action: 'transfer',
        amount,
        assetTicker,
        notes: 'Dashboard initiated transfer',
      });

      return outcome;
    } finally {
      setIsLoading(false);
    }
  };

  const mint = async (
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> => {
    setIsLoading(true);
    try {
      const outcome = await getAegisProvider().mint(to, amount, onPhase);
      const txHash = outcome.hash ?? outcome.txHash ?? `tx_mint_${Date.now()}`;

      addRecord({
        kind: 'sdk_receipt',
        txHash,
        successful: mapOutcomeSuccessful(outcome),
        signer: actor,
        recipient: to,
        createdAt: new Date().toISOString(),
        action: 'mint',
        notes: 'Admin mint action from dashboard',
      });

      return outcome;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkWhitelist, transfer, mint, getPortfolio, isLoading };
};
