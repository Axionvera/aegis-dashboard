/**
 * src/fixtures/index.ts
 *
 * Barrel export for all top-level mock fixtures.
 * Import from here in tests or when you need all fixture sets.
 *
 * For production code, prefer the specific fixture file to keep
 * bundle analysis clear.
 */

export { mockPortfolioFixture } from './portfolio';
export { mockComplianceSubjects } from './compliance';
export { transactionHistoryFixtures, transactionHistoryFixtureInputs } from './transactions';
export { mockDiagnosticsFixture } from './diagnostics';
export { mockIssuanceRequests } from './issuer';
export type { IssuanceRequest } from './issuer';
