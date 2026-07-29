/**
 * IAegisProvider — the stable contract every SDK provider must satisfy.
 *
 * The mock provider and the future live provider both implement this interface
 * so that the rest of the application never has to know which one is active.
 * All RPC concerns stay inside the provider; the UI only ever imports from
 * `src/lib/sdk/index.ts`.
 */

import type { PortfolioReadModel } from '@/lib/aegis/types';
import type {
  RawTransactionOutcome,
  TransactionPhase,
} from '@/components/transactions/types';
import type { BudgetReviewResult } from '@/lib/performanceBudget';

/** Called as the transaction moves from wallet signature to network submission. */
export type PhaseListener = (phase: TransactionPhase) => void;

export interface IAegisProvider {
  /**
   * Fetch the investor's compliant-holdings read model.
   * Mirrors `AegisClient.portfolio.get(address)` in the real SDK.
   */
  getPortfolio(investorAddress: string): Promise<PortfolioReadModel>;

  /**
   * Check whether a recipient address is KYC whitelisted on the contract.
   */
  checkWhitelist(address: string): Promise<boolean>;

  /**
   * Initiate a compliant asset transfer.
   */
  transfer(
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome>;

  /**
   * Initiate an admin mint action.
   */
  mint(
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome>;

  /**
   * Fetch the performance budget review results for a portfolio.
   * Returns an empty array when no budgets are configured.
   */
  getPerformanceBudget(
    portfolioId: string,
  ): Promise<BudgetReviewResult[]>;
}
