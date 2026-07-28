import { useState } from 'react';
import * as aegisClient from '@/lib/aegis/client';
import type { PortfolioReadModel } from '@/lib/aegis/types';
import type {
  RawTransactionOutcome,
  TransactionPhase,
} from '@/components/transactions/types';

/** Called as the transaction moves from wallet signature to network submission. */
type PhaseListener = (phase: TransactionPhase) => void;

/**
 * Thin wrapper around the Aegis SDK client. Real Soroban RPC calls should
 * be added to src/lib/aegis/client.ts, not here — this hook only manages
 * loading state for the UI.
 */
export const useAegis = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getPortfolio = async (address: string): Promise<PortfolioReadModel> => {
    setIsLoading(true);
    try {
      return await aegisClient.getPortfolio(address);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWhitelist = async (address: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      return await aegisClient.checkWhitelist(address);
    } finally {
      setIsLoading(false);
    }
  };

  const transfer = async (
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> => {
    setIsLoading(true);
    try {
      return await aegisClient.transfer(to, amount, onPhase);
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
      return await aegisClient.mint(to, amount, onPhase);
    } finally {
      setIsLoading(false);
    }
  };

  return { getPortfolio, checkWhitelist, transfer, mint, isLoading };
};
