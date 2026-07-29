/**
 * MockAegisProvider
 *
 * Returns deterministic fixture data for every SDK operation. This provider
 * is ONLY intended for local frontend development and must never run against
 * a real network.
 *
 * Data source: src/fixtures/
 *
 * SAFETY
 * ------
 * - All returned data is clearly synthetic (Stellar-style addresses that are
 *   obviously not real accounts, placeholder amounts, etc.).
 * - The provider is only instantiated when isMockModeEnabled() returns true
 *   and assertMockModeSafe() passes (enforced in the factory).
 * - A UI banner (MockModeBanner) is rendered whenever this provider is active
 *   to make the mock state unmistakable to the developer.
 */

import type { IAegisProvider, PhaseListener } from './IAegisProvider';
import type { PortfolioReadModel } from '@/lib/aegis/types';
import type { WhitelistEntry } from '@/lib/whitelist';
import type { RawTransactionOutcome } from '@/components/transactions/types';
import type { BudgetReviewResult } from '@/lib/performanceBudget';
import { mockPortfolioFixture } from '@/fixtures/portfolio';
import { sampleBudgetResults } from '@/lib/__fixtures__/performanceBudget';

const MOCK_LATENCY_MS = 600;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Determines a mock transaction outcome from the amount so every receipt
 * variant stays reachable from the UI without editing code:
 *
 *   0.01 → failure   0.02 → pending   0.03 → unknown status   else → success
 */
function mockOutcome(amount: number, hash: string): RawTransactionOutcome {
  switch (amount) {
    case 0.01:
      return {
        status: 'FAILED',
        errorMessage: '[MOCK] Recipient account is not authorised to hold this asset.',
      };
    case 0.02:
      return { status: 'PENDING', hash };
    case 0.03:
      return { status: 'not_a_real_status', hash };
    default:
      return { status: 'SUCCESS', hash };
  }
}

async function simulateSubmission(onPhase?: PhaseListener): Promise<void> {
  onPhase?.('signing');
  await wait(MOCK_LATENCY_MS);
  onPhase?.('pending');
  await wait(MOCK_LATENCY_MS);
}

export class MockAegisProvider implements IAegisProvider {
  /** Visible label used by the DiagnosticsPanel and the mock banner. */
  readonly providerName = 'MockAegisProvider';

  /**
   * In-memory copy of the whitelist fixture, mutated by add/remove calls so
   * the admin dashboard sees its own changes reflected within a session.
   * Resets on page reload — this is a mock, not persistence.
   */
  private whitelist: WhitelistEntry[] = sampleWhitelistEntries.map((entry) => ({
    ...entry,
  }));

  async getPortfolio(investorAddress: string): Promise<PortfolioReadModel> {
    if (!investorAddress) {
      throw new Error('[MOCK] An investor address is required to load a portfolio.');
    }
    await wait(MOCK_LATENCY_MS);
    return {
      ...mockPortfolioFixture,
      investorAddress,
      fetchedAt: new Date().toISOString(),
    };
  }

  async checkWhitelist(address: string): Promise<boolean> {
    await wait(500);
    // Mimic the real client's heuristic: Stellar G-addresses above a minimum
    // length are considered whitelisted in the mock.
    return address.startsWith('G') && address.length > 50;
  }

  async listWhitelist(): Promise<WhitelistEntry[]> {
    await wait(MOCK_LATENCY_MS);
    // Return copies so callers can't mutate our internal state directly.
    return this.whitelist.map((entry) => ({ ...entry }));
  }

  async addToWhitelist(
    address: string,
    actor: string,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    if (!address) {
      throw new Error('[MOCK] An address is required to add to the whitelist.');
    }
    await simulateSubmission(onPhase);

    const now = new Date().toISOString();
    const existing = this.whitelist.find((entry) => entry.address === address);
    if (existing) {
      existing.status = 'whitelisted';
      existing.updatedBy = actor;
      existing.updatedAt = now;
    } else {
      this.whitelist = [
        { address, status: 'whitelisted', updatedBy: actor, updatedAt: now },
        ...this.whitelist,
      ];
    }

    return { status: 'SUCCESS', hash: `mock_tx_hash_whitelist_add_${Date.now()}` };
  }

  async removeFromWhitelist(
    address: string,
    actor: string,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    if (!address) {
      throw new Error('[MOCK] An address is required to remove from the whitelist.');
    }
    await simulateSubmission(onPhase);

    const now = new Date().toISOString();
    const existing = this.whitelist.find((entry) => entry.address === address);
    if (existing) {
      existing.status = 'revoked';
      existing.updatedBy = actor;
      existing.updatedAt = now;
    }

    return { status: 'SUCCESS', hash: `mock_tx_hash_whitelist_remove_${Date.now()}` };
  }

  async transfer(
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    void to;
    await simulateSubmission(onPhase);
    return mockOutcome(amount, 'mock_tx_hash_transfer_1234567890');
  }

  async mint(
    to: string,
    amount: number,
    onPhase?: PhaseListener,
  ): Promise<RawTransactionOutcome> {
    void to;
    await simulateSubmission(onPhase);
    return mockOutcome(amount, 'mock_tx_hash_mint_0987654321');
  }

  async getPerformanceBudget(
    portfolioId: string,
  ): Promise<BudgetReviewResult[]> {
    void portfolioId;
    await wait(400);
    return sampleBudgetResults;
  }
}
