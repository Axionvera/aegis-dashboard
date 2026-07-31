import { mapAdminActionReceipt } from './mapAdminActionReceipt';
import type { AdminActionReceipt } from './types';

const TARGET =
  'GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3';

const HASH =
  'b9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e';

export const whitelistAddReceiptFixture = mapAdminActionReceipt({
  operation: 'whitelist-add',
  target: TARGET,
  network: 'TESTNET',
  outcome: { status: 'SUCCESS', hash: HASH },
  metadata: { note: 'KYC case ref-001' },
});

export const whitelistRemoveReceiptFixture = mapAdminActionReceipt({
  operation: 'whitelist-remove',
  target: TARGET,
  network: 'TESTNET',
  outcome: { status: 'FAILED', errorMessage: 'Admin authorization failed.' },
});

export const assetRegistrationReceiptFixture = mapAdminActionReceipt({
  operation: 'asset-registration',
  target: 'NY-CRE',
  outcome: { status: 'SUCCESS' },
  metadata: {
    asset: 'Manhattan Commercial Real Estate (NY-CRE)',
    amount: '100,000.00',
    requestId: 'ISS-005',
  },
});

export const roleChangeReceiptFixture = mapAdminActionReceipt({
  operation: 'role-change',
  target: TARGET,
  network: 'TESTNET',
  outcome: { status: 'PENDING', hash: HASH },
  metadata: { role: 'Issuer' },
});

export const mintReceiptFixture = mapAdminActionReceipt({
  operation: 'mint',
  target: TARGET,
  network: 'TESTNET',
  outcome: { status: 'SUCCESS', hash: HASH },
  metadata: { asset: 'NY-CRE', amount: '1,000.00 NY-CRE' },
});

/** Major admin operations required by Issue #179. */
export const adminOperationReceiptFixtures: AdminActionReceipt[] = [
  whitelistAddReceiptFixture,
  whitelistRemoveReceiptFixture,
  assetRegistrationReceiptFixture,
  roleChangeReceiptFixture,
  mintReceiptFixture,
];

/** Every receipt status rendered by the view. */
export const adminReceiptStateFixtures: AdminActionReceipt[] = [
  mintReceiptFixture,
  whitelistRemoveReceiptFixture,
  roleChangeReceiptFixture,
  mapAdminActionReceipt({
    operation: 'mint',
    target: TARGET,
    network: 'TESTNET',
    outcome: { status: 'not-a-known-status', hash: HASH },
    metadata: { asset: 'NY-CRE', amount: '1,000.00 NY-CRE' },
  }),
];
