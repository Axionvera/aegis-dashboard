import { describe, it, expect } from 'vitest';
import {
  validateWhitelistAddress,
  searchWhitelistEntries,
  guardWhitelistAction,
  type WhitelistEntry,
} from './whitelist';

const VALID_ADDRESS = 'G' + 'A'.repeat(55); // 56 chars total
const entries: WhitelistEntry[] = [
  {
    address: 'GCFXUSERALICE0000000000000000000000000000000000000000',
    status: 'whitelisted',
    updatedBy: 'GCFXADMIN00000000000000000000000000000000000000000000',
    updatedAt: '2026-07-20T09:15:00.000Z',
    note: 'KYC case AML-2026-0142',
  },
  {
    address: 'GCFXUSERCAROL00000000000000000000000000000000000000000',
    status: 'revoked',
    updatedBy: 'GCFXADMIN00000000000000000000000000000000000000000000',
    updatedAt: '2026-06-30T11:45:00.000Z',
    note: 'Removed after accreditation lapsed',
  },
];

describe('validateWhitelistAddress', () => {
  it('rejects an empty address', () => {
    const result = validateWhitelistAddress('');
    expect(result.valid).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    const result = validateWhitelistAddress('   ');
    expect(result.valid).toBe(false);
  });

  it('rejects an address that does not start with G', () => {
    const result = validateWhitelistAddress('X' + 'A'.repeat(55));
    expect(result.valid).toBe(false);
  });

  it('rejects an address that is too short', () => {
    const result = validateWhitelistAddress('GABC');
    expect(result.valid).toBe(false);
  });

  it('accepts a well-formed 56-character G-address', () => {
    const result = validateWhitelistAddress(VALID_ADDRESS);
    expect(result.valid).toBe(true);
  });

  it('trims surrounding whitespace before validating', () => {
    const result = validateWhitelistAddress(`  ${VALID_ADDRESS}  `);
    expect(result.valid).toBe(true);
  });
});

describe('searchWhitelistEntries', () => {
  it('returns all entries for an empty query', () => {
    expect(searchWhitelistEntries(entries, '')).toHaveLength(2);
  });

  it('returns all entries for a whitespace-only query', () => {
    expect(searchWhitelistEntries(entries, '   ')).toHaveLength(2);
  });

  it('matches by partial address, case-insensitively', () => {
    const result = searchWhitelistEntries(entries, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].address).toContain('ALICE');
  });

  it('matches by note text', () => {
    const result = searchWhitelistEntries(entries, 'accreditation');
    expect(result).toHaveLength(1);
    expect(result[0].address).toContain('CAROL');
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchWhitelistEntries(entries, 'no-such-entry')).toHaveLength(0);
  });
});

describe('guardWhitelistAction', () => {
  it('blocks adding an address that is already whitelisted', () => {
    const reason = guardWhitelistAction(entries, entries[0].address, 'add');
    expect(reason).not.toBeNull();
  });

  it('allows adding a brand-new address', () => {
    const reason = guardWhitelistAction(entries, VALID_ADDRESS, 'add');
    expect(reason).toBeNull();
  });

  it('allows re-adding a revoked address', () => {
    const reason = guardWhitelistAction(entries, entries[1].address, 'add');
    expect(reason).toBeNull();
  });

  it('blocks removing an address that is not currently whitelisted', () => {
    const reason = guardWhitelistAction(entries, entries[1].address, 'remove');
    expect(reason).not.toBeNull();
  });

  it('blocks removing an address that was never whitelisted', () => {
    const reason = guardWhitelistAction(entries, VALID_ADDRESS, 'remove');
    expect(reason).not.toBeNull();
  });

  it('allows removing an address that is currently whitelisted', () => {
    const reason = guardWhitelistAction(entries, entries[0].address, 'remove');
    expect(reason).toBeNull();
  });
});
