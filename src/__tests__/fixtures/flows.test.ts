/**
 * Tests for src/fixtures/flows.ts — the end-to-end mock flow fixtures
 * (Issue #184).
 *
 * These tests are deliberately about referential integrity and coverage,
 * not about UI rendering: they confirm that each named journey resolves to
 * real entries in the underlying domain fixtures, that the three reviewable
 * outcomes are all represented, and that every domain named in the issue's
 * acceptance criteria (compliance, asset registration/minting, investor
 * portfolio, transactions, diagnostics) is present in every scenario.
 */

import { findFlowScenario, mockFlowScenarios } from '@/fixtures/flows';
import { mockComplianceSubjects } from '@/fixtures/compliance';
import { mockIssuanceRequests } from '@/fixtures/issuer';
import { mintableAssetsFixture } from '@/features/minting/fixtures';
import { mockPortfolioFixture } from '@/fixtures/portfolio';
import { transactionHistoryFixtures } from '@/fixtures/transactions';

describe('mockFlowScenarios', () => {
  it('exposes at least one scenario per reviewable outcome', () => {
    const outcomes = new Set(mockFlowScenarios.map((s) => s.outcome));
    expect(outcomes.has('compliant')).toBe(true);
    expect(outcomes.has('restricted')).toBe(true);
    expect(outcomes.has('pending_review')).toBe(true);
  });

  it('has unique, kebab-case scenario ids', () => {
    const ids = mockFlowScenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(mockFlowScenarios)(
    'scenario "$id" covers every acceptance-criteria domain',
    (scenario) => {
      expect(scenario.stages.compliance).toBeDefined();
      expect(scenario.stages.assetIssuance).toBeDefined();
      expect(scenario.stages.mintableAsset).toBeDefined();
      expect(scenario.stages.portfolio).toBeDefined();
      expect(scenario.stages.diagnostics).toBeDefined();
      expect(Array.isArray(scenario.stages.transactions)).toBe(true);
      expect(scenario.stages.transactions.length).toBeGreaterThan(0);
    },
  );

  it.each(mockFlowScenarios)(
    'scenario "$id" resolves to entries that exist in the underlying fixtures',
    (scenario) => {
      expect(mockComplianceSubjects).toContainEqual(scenario.stages.compliance);
      expect(mockIssuanceRequests).toContainEqual(scenario.stages.assetIssuance);
      expect(mintableAssetsFixture).toContainEqual(scenario.stages.mintableAsset);
      expect(mockPortfolioFixture.assets).toContainEqual(scenario.stages.portfolio);
      for (const tx of scenario.stages.transactions) {
        expect(transactionHistoryFixtures).toContainEqual(tx);
      }
    },
  );

  it.each(mockFlowScenarios)(
    'scenario "$id" uses the same investor address across compliance and metadata',
    (scenario) => {
      expect(scenario.stages.compliance.id).toBe(scenario.investorAddress);
    },
  );

  it('every fixture address is synthetic (GCFXMOCK-prefixed) and no real-looking addresses leak in', () => {
    for (const scenario of mockFlowScenarios) {
      expect(scenario.investorAddress.startsWith('GCFXMOCK')).toBe(true);
    }
  });
});

describe('findFlowScenario', () => {
  it('returns the matching scenario by id', () => {
    const scenario = findFlowScenario('compliant-investor-journey');
    expect(scenario?.outcome).toBe('compliant');
  });

  it('returns undefined for an unknown id', () => {
    expect(findFlowScenario('does-not-exist')).toBeUndefined();
  });
});