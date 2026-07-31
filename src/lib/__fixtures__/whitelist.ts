import type { WhitelistEntry } from '@/lib/whitelist';

/**
 * Sample whitelist entries used by MockAegisProvider and unit tests.
 *
 * All addresses are synthetic mock addresses — they do not represent real
 * accounts. Timestamps are illustrative ISO 8601 values.
 */
export const sampleWhitelistEntries: WhitelistEntry[] = [
  {
    address: 'GCFXUSERALICE0000000000000000000000000000000000000000',
    status: 'whitelisted',
    updatedBy: 'GCFXADMIN00000000000000000000000000000000000000000000',
    updatedAt: '2026-07-20T09:15:00.000Z',
    note: 'KYC case AML-2026-0142',
  },
  {
    address: 'GCFXUSERBOB0000000000000000000000000000000000000000000',
    status: 'whitelisted',
    updatedBy: 'GCFXADMIN00000000000000000000000000000000000000000000',
    updatedAt: '2026-07-18T14:02:00.000Z',
  },
  {
    address: 'GCFXUSERCAROL00000000000000000000000000000000000000000',
    status: 'revoked',
    updatedBy: 'GCFXADMIN00000000000000000000000000000000000000000000',
    updatedAt: '2026-06-30T11:45:00.000Z',
    note: 'Removed after accreditation lapsed',
  },
];
