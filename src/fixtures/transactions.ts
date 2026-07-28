/**
 * src/fixtures/transactions.ts
 *
 * Re-exports the canonical transaction history fixture set from the
 * features/transactions slice so that the mock provider and any top-level
 * fixture consumers have a single, consistent import path.
 *
 * Source of truth: src/features/transactions/fixtures.ts
 *
 * Consumed by: MockAegisProvider (future `getTransactionHistory` method),
 * tests, and Storybook stories.
 */

export {
  transactionHistoryFixtures,
  transactionHistoryFixtureInputs,
} from '@/features/transactions/fixtures';
