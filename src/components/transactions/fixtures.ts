import type { TransactionDetails, TransactionResult } from './types';

/**
 * Sample data for previewing the transaction components without running a real
 * flow — useful for manual QA of the failure and unknown states, which the
 * mocked `useAegis` hook never produces on its own.
 */

export const transferDetailsFixture: TransactionDetails = {
  action: 'transfer',
  title: 'Transfer AEGIS',
  description: 'Review the details before signing this transfer.',
  network: 'TESTNET',
  rows: [
    { label: 'Asset', value: 'AEGIS' },
    { label: 'Amount', value: '250.00 AEGIS' },
    {
      label: 'Recipient',
      value: 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H',
      mono: true,
    },
    { label: 'Network', value: 'TESTNET' },
  ],
};

export const mintDetailsFixture: TransactionDetails = {
  action: 'mint',
  title: 'Mint AEGIS',
  description: 'This issues new supply to the target address.',
  network: 'TESTNET',
  rows: [
    { label: 'Amount', value: '1,000.00 AEGIS' },
    {
      label: 'Target address',
      value: 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKB6YSQVWPFPRLE7MRCQ4BQ7A',
      mono: true,
    },
    { label: 'Network', value: 'TESTNET' },
  ],
};

export const complianceDetailsFixture: TransactionDetails = {
  action: 'compliance-update',
  title: 'Update compliance status',
  description: 'Marks the investor as KYC whitelisted on-chain.',
  network: 'TESTNET',
  rows: [
    {
      label: 'Investor',
      value: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37',
      mono: true,
    },
    { label: 'New status', value: 'Whitelisted' },
  ],
};

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
