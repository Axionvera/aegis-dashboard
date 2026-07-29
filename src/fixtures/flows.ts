/**
 * src/fixtures/flows.ts
 *
 * End-to-end mock flow fixtures (Issue #184).
 *
 * The other files in src/fixtures/ each cover one domain in isolation
 * (compliance subjects, issuance requests, mintable assets, portfolio
 * holdings, transaction history, diagnostics). This file does not duplicate
 * that data — it assembles references to it into a small set of named
 * "journeys", each representing one investor moving through the full
 * lifecycle: compliance review -> asset registration -> minting ->
 * portfolio holding -> transaction history -> diagnostics visibility.
 *
 * Use these when a test or story needs a *coherent* cross-feature scenario
 * (e.g. "show what a restricted investor looks like everywhere in the app")
 * rather than independent per-domain fixtures that don't necessarily agree
 * with one another on address, asset, or outcome.
 *
 * All identifiers are synthetic. See docs/mock-flow-fixtures.md.
 *
 * Consumed by: tests, Storybook stories, manual QA in mock mode.
 * Not consumed by MockAegisProvider directly — see mock-mode.md for the
 * provider's own fixture wiring.
 */

import type { ComplianceSubject } from '@/lib/complianceReview';
import type { PortfolioAsset } from '@/lib/aegis/types';
import type { NormalizedTransaction } from '@/features/transactions/types';
import type { MintableAsset } from '@/features/minting/fixtures';
import type { IssuanceRequest } from '@/fixtures/issuer';

import { mockComplianceSubjects } from '@/fixtures/compliance';
import { mockIssuanceRequests } from '@/fixtures/issuer';
import { mockPortfolioFixture } from '@/fixtures/portfolio';
import { transactionHistoryFixtures } from '@/fixtures/transactions';
import { mockDiagnosticsFixture } from '@/fixtures/diagnostics';
import { mintableAssetsFixture } from '@/features/minting/fixtures';

/** Outcome this journey is designed to demonstrate end-to-end. */
export type MockFlowOutcome = 'compliant' | 'restricted' | 'pending_review';

export interface MockFlowScenario {
  /** Stable, kebab-case identifier for lookup in tests. */
  id: string;
  /** Human-readable name shown in test output / story titles. */
  title: string;
  /** One-line summary of what the scenario demonstrates. */
  description: string;
  /** The outcome exercised across every stage of the journey. */
  outcome: MockFlowOutcome;
  /** Synthetic investor address, consistent across every stage below. */
  investorAddress: string;
  stages: {
    compliance: ComplianceSubject;
    assetIssuance: IssuanceRequest;
    mintableAsset: MintableAsset;
    portfolio: PortfolioAsset;
    transactions: NormalizedTransaction[];
    diagnostics: typeof mockDiagnosticsFixture;
  };
}

function requireCompliance(id: string): ComplianceSubject {
  const subject = mockComplianceSubjects.find((s) => s.id === id);
  if (!subject) {
    throw new Error(`mock flow fixture: no compliance subject with id ${id}`);
  }
  return subject;
}

function requireIssuance(id: string): IssuanceRequest {
  const request = mockIssuanceRequests.find((r) => r.id === id);
  if (!request) {
    throw new Error(`mock flow fixture: no issuance request with id ${id}`);
  }
  return request;
}

function requireMintableAsset(id: string): MintableAsset {
  const asset = mintableAssetsFixture.find((a) => a.id === id);
  if (!asset) {
    throw new Error(`mock flow fixture: no mintable asset with id ${id}`);
  }
  return asset;
}

function requirePortfolioAsset(id: string): PortfolioAsset {
  const asset = mockPortfolioFixture.assets.find((a) => a.id === id);
  if (!asset) {
    throw new Error(`mock flow fixture: no portfolio asset with id ${id}`);
  }
  return asset;
}

function transactionsFor(ticker: string): NormalizedTransaction[] {
  const matches = transactionHistoryFixtures.filter((tx) => tx.assetTicker === ticker);
  if (matches.length === 0) {
    throw new Error(`mock flow fixture: no transactions with assetTicker ${ticker}`);
  }
  return matches;
}

/**
 * Alice: fully compliant investor.
 * Compliance approved -> asset minted -> portfolio compliant/eligible ->
 * successful transfer history -> diagnostics green across the board.
 */
const compliantInvestorJourney: MockFlowScenario = {
  id: 'compliant-investor-journey',
  title: 'Compliant investor, full lifecycle',
  description:
    'An investor whose KYC/accreditation checks pass, whose asset issuance was approved and minted, and whose portfolio and transaction history reflect a clean, eligible state.',
  outcome: 'compliant',
  investorAddress: 'GCFXMOCKBOB0000000000000000000000000000000000000000000000000',
  stages: {
    compliance: requireCompliance('GCFXMOCKBOB0000000000000000000000000000000000000000000000000'),
    assetIssuance: requireIssuance('ISS-001'),
    mintableAsset: requireMintableAsset('ny-cre'),
    portfolio: requirePortfolioAsset('ny-cre'),
    transactions: transactionsFor('NY-CRE'),
    diagnostics: mockDiagnosticsFixture,
  },
};

/**
 * Charlie: escalated / restricted investor.
 * Compliance flagged for review -> asset paused -> portfolio restricted/
 * ineligible -> a failed transfer in the transaction history.
 */
const restrictedInvestorJourney: MockFlowScenario = {
  id: 'restricted-investor-journey',
  title: 'Restricted investor, compliance escalation',
  description:
    'An investor whose accreditation is flagged for renewal, whose asset holding has been paused by the issuer pending compliance review, and whose transfer history shows a policy rejection.',
  outcome: 'restricted',
  investorAddress: 'GCFXMOCKCHARLIE00000000000000000000000000000000000000000000',
  stages: {
    compliance: requireCompliance('GCFXMOCKCHARLIE00000000000000000000000000000000000000000000'),
    assetIssuance: requireIssuance('ISS-007'),
    mintableAsset: requireMintableAsset('eu-infra'),
    portfolio: requirePortfolioAsset('fr-log'),
    transactions: transactionsFor('NY-CRE').filter((tx) => tx.status === 'failed'),
    diagnostics: mockDiagnosticsFixture,
  },
};

/**
 * Eve: pending-review investor.
 * Sanctions screen still awaiting a third-party response -> asset request
 * still pending -> portfolio holding stuck in "pending review" / data
 * unavailable -> transaction history shows an in-flight admin action.
 */
const pendingReviewInvestorJourney: MockFlowScenario = {
  id: 'pending-review-investor-journey',
  title: 'Pending-review investor, in-flight checks',
  description:
    'An investor mid-onboarding: sanctions screening has not returned a result, the asset issuance request is still pending, and the portfolio view falls back to its data-unavailable state.',
  outcome: 'pending_review',
  investorAddress: 'GCFXMOCKEVE0000000000000000000000000000000000000000000000000',
  stages: {
    compliance: requireCompliance('GCFXMOCKEVE0000000000000000000000000000000000000000000000000'),
    assetIssuance: requireIssuance('ISS-003'),
    mintableAsset: requireMintableAsset('ust-6m'),
    portfolio: requirePortfolioAsset('sg-pcn'),
    transactions: [
      transactionHistoryFixtures.find((tx) => tx.operation === 'admin_action'),
    ].filter((tx): tx is NormalizedTransaction => Boolean(tx)),
    diagnostics: mockDiagnosticsFixture,
  },
};

/** All end-to-end mock flow scenarios, keyed by id for convenient lookup. */
export const mockFlowScenarios: MockFlowScenario[] = [
  compliantInvestorJourney,
  restrictedInvestorJourney,
  pendingReviewInvestorJourney,
];

/** Look up a single scenario by id. Returns undefined if not found. */
export function findFlowScenario(id: string): MockFlowScenario | undefined {
  return mockFlowScenarios.find((scenario) => scenario.id === id);
}