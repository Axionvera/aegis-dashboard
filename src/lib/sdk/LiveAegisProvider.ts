/**
 * LiveAegisProvider
 *
 * Thin adapter that delegates every operation to the existing `client.ts`
 * module, which currently contains the mock-latency stubs that will be
 * replaced with real `@aegis/sdk` calls once the package is published.
 *
 * When the real SDK is available:
 * 1. Install the package (`npm install @aegis/sdk`).
 * 2. Replace the imports below with the real SDK client.
 * 3. Implement each method body against the SDK's API.
 * 4. Nothing outside this file should need to change.
 *
 * See docs/investor-dashboard.md and docs/mock-mode.md for context.
 */

import type { IAegisProvider, PhaseListener } from './IAegisProvider';
import type { PortfolioReadModel } from '@/lib/aegis/types';
import type { WhitelistEntry } from '@/lib/whitelist';
import type { RawTransactionOutcome } from '@/components/transactions/types';
import type { BudgetReviewResult } from '@/lib/performanceBudget';
import type { RawAddressComplianceRecord } from '@/features/compliance/types';
import * as aegisClient from '@/lib/aegis/client';

export class LiveAegisProvider implements IAegisProvider {
  readonly providerName = 'LiveAegisProvider';

  getPortfolio(investorAddress: string): Promise<PortfolioReadModel> {
    return aegisClient.getPortfolio(investorAddress);
  }

  checkWhitelist(address: string): Promise<boolean> {
    return aegisClient.checkWhitelist(address);
  }

  listWhitelist(): Promise<WhitelistEntry[]> {
    return aegisClient.listWhitelist();
  }

  addToWhitelist(
    address: string,
    actor: string,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    return aegisClient.addToWhitelist(address, actor, onPhase);
  }

  removeFromWhitelist(
    address: string,
    actor: string,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    return aegisClient.removeFromWhitelist(address, actor, onPhase);
  }

  getAddressCompliance(address: string): Promise<RawAddressComplianceRecord> {
    return aegisClient.getAddressCompliance(address);
  }

  transfer(
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    return aegisClient.transfer(to, amount, onPhase);
  }

  mint(
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    return aegisClient.mint(to, amount, onPhase);
  }

  getPerformanceBudget(
    portfolioId: string,
  ): Promise<BudgetReviewResult[]> {
    return aegisClient.getPerformanceBudget(portfolioId);
  }
}
