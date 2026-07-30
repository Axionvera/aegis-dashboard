import type { TransactionDetails, TransactionResult } from './types';
import {
  buildComplianceUpdateSummary,
  buildMintSummary,
  buildTransferSummary,
  buildWhitelistSummary,
} from './operationSummary';

interface TransactionFixtureGalleryEntry {
  id: string;
  kind: 'review' | 'progress' | 'receipt';
  title: string;
  description: string;
  details?: TransactionDetails;
  state?: 'signing' | 'pending';
  result?: TransactionResult;
  explorerUrl?: string | null;
}

/**
 * Sample data for previewing the transaction components without running a real
 * flow — useful for manual QA of the failure and unknown states, which the
 * mocked `useAegis` hook never produces on its own.
 */

export const transferDetailsFixture: TransactionDetails = buildTransferSummary({
  assetTicker: 'AEGIS',
  amount: 250,
  recipient: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
  network: 'TESTNET',
});

export const mintDetailsFixture: TransactionDetails = buildMintSummary({
  assetTicker: 'AEGIS',
  amount: 1000,
  recipient: 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKB6YSQVWPFPRLE7MRCQ4BQ7A',
  network: 'TESTNET',
});

export const whitelistDetailsFixture: TransactionDetails = buildWhitelistSummary({
  action: 'add',
  address: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
  note: 'KYC case ref-001',
  network: 'TESTNET',
});

export const complianceDetailsFixture: TransactionDetails = buildComplianceUpdateSummary({
  action: 'approve',
  actionLabel: 'Approve',
  network: 'TESTNET',
  subjects: [
    {
      id: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
      status: 'pending',
      severity: 'medium',
      checks: [],
      selected: true,
    },
  ],
});

export const successResultFixture: TransactionResult = {
  status: 'success',
  txHash: 'b9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e',
  message: 'Transaction confirmed',
};

export const pendingResultFixture: TransactionResult = {
  status: 'pending',
  txHash: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f50',
  message: 'Transaction submitted',
  detail:
    'The network has accepted it and is still confirming. This usually takes a few seconds.',
};

export const failureResultFixture: TransactionResult = {
  status: 'failure',
  message: 'Transaction failed',
  detail: 'Recipient account is not authorised to hold this asset.',
};

export const unknownResultFixture: TransactionResult = {
  status: 'unknown',
  message: 'Transaction status unknown',
  detail:
    "We couldn't confirm the outcome. Check the explorer before retrying — the transaction may still go through.",
};

export const transactionResultFixtures: TransactionResult[] = [
  successResultFixture,
  pendingResultFixture,
  failureResultFixture,
  unknownResultFixture,
];

export const transactionReviewFixtures: TransactionDetails[] = [
  transferDetailsFixture,
  mintDetailsFixture,
  whitelistDetailsFixture,
  complianceDetailsFixture,
];

export const transactionFixtureGalleryEntries: TransactionFixtureGalleryEntry[] = [
  {
    id: 'review-transfer',
    kind: 'review',
    title: 'Review transfer before signing',
    description: 'Preview the confirmation screen for a transfer request.',
    details: transferDetailsFixture,
  },
  {
    id: 'review-mint',
    kind: 'review',
    title: 'Review mint request',
    description: 'Preview the confirmation copy for an issuance workflow.',
    details: mintDetailsFixture,
  },
  {
    id: 'review-whitelist',
    kind: 'review',
    title: 'Review whitelist update',
    description: 'Preview the confirmation screen for a whitelist add action.',
    details: whitelistDetailsFixture,
  },
  {
    id: 'review-compliance',
    kind: 'review',
    title: 'Review compliance update',
    description: 'Preview the review screen for a compliance action.',
    details: complianceDetailsFixture,
  },
  {
    id: 'progress-signing',
    kind: 'progress',
    title: 'Waiting for wallet signature',
    description: 'Shows the in-flight state while the wallet prompt is open.',
    state: 'signing',
  },
  {
    id: 'progress-pending',
    kind: 'progress',
    title: 'Submitting to the network',
    description: 'Shows the pending state after the transaction is submitted.',
    state: 'pending',
  },
  {
    id: 'receipt-success',
    kind: 'receipt',
    title: 'Success receipt',
    description: 'Preview the final confirmation screen for a successful transaction.',
    details: transferDetailsFixture,
    result: successResultFixture,
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/b9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e',
  },
  {
    id: 'receipt-pending',
    kind: 'receipt',
    title: 'Pending receipt',
    description: 'Preview the submitted-but-unconfirmed receipt state.',
    details: transferDetailsFixture,
    result: pendingResultFixture,
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f50',
  },
  {
    id: 'receipt-failure',
    kind: 'receipt',
    title: 'Failure receipt',
    description: 'Preview the error state that appears when a transaction is rejected.',
    details: transferDetailsFixture,
    result: failureResultFixture,
  },
  {
    id: 'receipt-unknown',
    kind: 'receipt',
    title: 'Unknown outcome receipt',
    description: 'Preview the guarded unknown-state copy for ambiguous outcomes.',
    details: transferDetailsFixture,
    result: unknownResultFixture,
  },
];
