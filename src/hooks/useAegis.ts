import { useState } from 'react';
import * as aegisClient from '@/lib/aegis/client';
import type { PortfolioReadModel } from '@/lib/aegis/types';
import type {
  RawTransactionOutcome,
  TransactionPhase,
} from '@/components/transactions/types';
import { resolveWalletRole } from '@/features/auth/resolveRole';
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
 * Thin wrapper around the Aegis SDK client. Real Soroban RPC calls should
 * be added to src/lib/aegis/client.ts, not here — this hook only manages
 * loading state for the UI.
 */
export const useAegis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const addRecord = useTransactionHistoryStore((state) => state.addRecord);
  const { address } = useWallet();
  const actor = address ?? 'unknown-actor';

  const getPortfolio = async (investorAddress: string): Promise<PortfolioReadModel> => {
    setIsLoading(true);
    try {
      return await aegisClient.getPortfolio(investorAddress);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWhitelist = async (target: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const isCompliant = await aegisClient.checkWhitelist(target);
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
      const outcome = await aegisClient.transfer(to, amount, onPhase);
      const txHash = outcome.hash ?? outcome.txHash ?? `mock_tx_hash_transfer_${Date.now()}`;

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
      const outcome = await aegisClient.mint(to, amount, onPhase);
      const txHash = outcome.hash ?? outcome.txHash ?? `mock_tx_hash_mint_${Date.now()}`;

      addRecord({
        kind: 'sdk_receipt',
        txHash,
        successful: mapOutcomeSuccessful(outcome),
        signer: actor,
        recipient: to,
        createdAt: new Date().toISOString(),
        action: 'mint',
        amount,
        notes: 'Admin mint action from dashboard',
      });

      return outcome;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkWhitelist,
    transfer,
    mint,
    getPortfolio,
    getWalletRole: resolveWalletRole,
    isLoading,
  };
};
