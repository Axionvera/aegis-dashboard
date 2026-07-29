import { describe, expect, it } from 'vitest';
import {
  buildComplianceUpdateSummary,
  buildMintSummary,
  buildTransferSummary,
  buildWhitelistSummary,
} from './operationSummary';
import { transactionReviewFixtures } from './fixtures';

const RECIPIENT = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';
const SIGNER = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';

describe('buildTransferSummary', () => {
  it('includes operation, target, asset, network, expected result, and risk notes', () => {
    const summary = buildTransferSummary({
      assetTicker: 'NY-CRE',
      amount: 25,
      recipient: RECIPIENT,
      fromAddress: SIGNER,
      network: 'TESTNET',
    });

    expect(summary.action).toBe('transfer');
    expect(summary.rows).toEqual(
      expect.arrayContaining([
        { label: 'Operation', value: 'Transfer' },
        { label: 'Asset', value: 'NY-CRE' },
        { label: 'Target', value: RECIPIENT, mono: true },
        { label: 'Network', value: 'TESTNET' },
      ]),
    );
    expect(summary.expectedResult).toMatch(/moves to the recipient/i);
    expect(summary.riskNotes?.length).toBeGreaterThan(0);
    expect(summary.riskNotes?.join(' ')).toMatch(/wallet network/i);
  });
});

describe('buildMintSummary', () => {
  it('summarises mint target, asset, and expected issuance result', () => {
    const summary = buildMintSummary({
      assetTicker: 'UST-6M',
      assetName: 'US Treasury Bill 6-Mo',
      assetClass: 'Fixed Income',
      amount: 50,
      recipient: RECIPIENT,
      signerAddress: SIGNER,
      network: 'TESTNET',
    });

    expect(summary.action).toBe('mint');
    expect(summary.title).toBe('Mint UST-6M');
    expect(summary.rows).toEqual(
      expect.arrayContaining([
        { label: 'Operation', value: 'Mint' },
        { label: 'Target', value: RECIPIENT, mono: true },
        { label: 'Network', value: 'TESTNET' },
      ]),
    );
    expect(summary.expectedResult).toMatch(/new ust-6m supply/i);
    expect(summary.riskNotes?.join(' ')).toMatch(/circulating supply/i);
  });
});

describe('buildWhitelistSummary', () => {
  it('covers add and remove actions with protocol-safe risk notes', () => {
    const add = buildWhitelistSummary({
      action: 'add',
      address: RECIPIENT,
      note: 'case-1',
      network: 'TESTNET',
    });
    const remove = buildWhitelistSummary({
      action: 'remove',
      address: RECIPIENT,
      network: 'PUBLIC',
    });

    expect(add.action).toBe('whitelist');
    expect(add.rows).toEqual(
      expect.arrayContaining([
        { label: 'Operation', value: 'Whitelist add' },
        { label: 'Target', value: RECIPIENT, mono: true },
        { label: 'Note', value: 'case-1' },
      ]),
    );
    expect(add.expectedResult).toMatch(/eligible to hold/i);
    expect(add.riskNotes?.join(' ')).toMatch(/not legal, regulatory, or financial advice/i);

    expect(remove.title).toMatch(/remove address/i);
    expect(remove.expectedResult).toMatch(/loses protocol permission/i);
    expect(remove.rows).toEqual(
      expect.arrayContaining([{ label: 'Network', value: 'PUBLIC' }]),
    );
  });
});

describe('buildComplianceUpdateSummary', () => {
  it('lists selected targets and expected protocol outcome', () => {
    const summary = buildComplianceUpdateSummary({
      action: 'approve',
      actionLabel: 'Approve',
      network: 'TESTNET',
      subjects: [
        {
          id: RECIPIENT,
          status: 'pending',
          severity: 'medium',
          checks: [],
        },
        {
          id: SIGNER,
          status: 'review',
          severity: 'high',
          checks: [],
        },
      ],
    });

    expect(summary.action).toBe('compliance-update');
    expect(summary.rows).toEqual(
      expect.arrayContaining([
        { label: 'Operation', value: 'Compliance update' },
        { label: 'Action', value: 'Approve' },
        { label: 'Selected subjects', value: '2' },
        { label: 'Network', value: 'TESTNET' },
      ]),
    );
    expect(summary.expectedResult).toMatch(/approve/i);
    expect(summary.riskNotes?.length).toBeGreaterThan(0);
  });
});

describe('transaction review fixtures', () => {
  it('covers every major sensitive operation type', () => {
    const actions = transactionReviewFixtures.map((fixture) => fixture.action);
    expect(actions).toEqual(
      expect.arrayContaining(['transfer', 'mint', 'whitelist', 'compliance-update']),
    );

    for (const fixture of transactionReviewFixtures) {
      expect(fixture.expectedResult).toBeTruthy();
      expect(fixture.riskNotes?.length).toBeGreaterThan(0);
      expect(fixture.rows.some((row) => row.label === 'Network')).toBe(true);
      expect(
        fixture.rows.some((row) => row.label === 'Target' || row.label.startsWith('Target ')),
      ).toBe(true);
    }
  });
});
