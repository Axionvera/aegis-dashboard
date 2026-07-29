/**
 * Operation summary mapper for the pre-signature review modal.
 *
 * Builds a consistent `TransactionDetails` object for every sensitive dashboard
 * action — transfer, mint, whitelist, and compliance update — so callers do not
 * invent their own review copy, risk notes, or expected-result wording.
 */

import { formatAmount, truncateAddress } from '@/utils/formatting';
import { withDisclaimer } from '@/lib/complianceReview';
import type { BulkAction, ComplianceSubject } from '@/lib/complianceReview';
import type { TransactionDetails } from './types';

export type WhitelistSummaryAction = 'add' | 'remove';

export interface TransferSummaryInput {
  assetTicker: string;
  amount: number;
  recipient: string;
  fromAddress?: string | null;
  network?: string | null;
}

export interface MintSummaryInput {
  assetTicker?: string;
  assetName?: string;
  assetClass?: string;
  amount: number;
  recipient: string;
  signerAddress?: string | null;
  network?: string | null;
}

export interface WhitelistSummaryInput {
  action: WhitelistSummaryAction;
  address: string;
  note?: string;
  network?: string | null;
}

export interface ComplianceUpdateSummaryInput {
  action: BulkAction;
  subjects: ComplianceSubject[];
  network?: string | null;
  actionLabel: string;
}

const SHARED_NETWORK_RISK =
  'Confirm the wallet network matches the dashboard environment before signing.';

const SHARED_SIGNATURE_RISK =
  'Once you approve in the wallet, the transaction may be submitted to the network and cannot be undone from this screen.';

function networkLabel(network?: string | null): string {
  return network?.trim() || 'Unknown';
}

function withNetworkRow(
  rows: TransactionDetails['rows'],
  network?: string | null,
): TransactionDetails['rows'] {
  return [...rows, { label: 'Network', value: networkLabel(network) }];
}

/** Build the review summary for an investor transfer. */
export function buildTransferSummary(input: TransferSummaryInput): TransactionDetails {
  const amountLabel = `${formatAmount(input.amount || 0)} ${input.assetTicker}`;

  return {
    action: 'transfer',
    title: `Transfer ${input.assetTicker}`,
    description: 'Review the details before signing this transfer.',
    network: input.network ?? undefined,
    expectedResult: `${amountLabel} moves to the recipient if the network confirms the transfer.`,
    riskNotes: [
      'Transfers are final once confirmed on-chain.',
      'The recipient must remain protocol-eligible to hold this asset.',
      SHARED_NETWORK_RISK,
      SHARED_SIGNATURE_RISK,
    ],
    rows: withNetworkRow(
      [
        { label: 'Operation', value: 'Transfer' },
        { label: 'Asset', value: input.assetTicker },
        { label: 'Amount', value: amountLabel },
        { label: 'Target', value: input.recipient, mono: true },
        ...(input.fromAddress
          ? [{ label: 'From', value: truncateAddress(input.fromAddress), mono: true }]
          : []),
      ],
      input.network,
    ),
  };
}

/** Build the review summary for an admin mint. */
export function buildMintSummary(input: MintSummaryInput): TransactionDetails {
  const ticker = input.assetTicker ?? 'asset';
  const amountLabel = input.assetTicker
    ? `${formatAmount(input.amount || 0)} ${input.assetTicker}`
    : formatAmount(input.amount || 0);

  return {
    action: 'mint',
    title: input.assetTicker ? `Mint ${input.assetTicker}` : 'Mint asset',
    description: 'This issues new supply directly to the recipient address.',
    network: input.network ?? undefined,
    expectedResult: `New ${ticker} supply is credited to the recipient if the mint confirms.`,
    riskNotes: [
      'Minting increases circulating supply for this asset.',
      'Only mint to addresses that have passed the protocol compliance check.',
      SHARED_NETWORK_RISK,
      SHARED_SIGNATURE_RISK,
    ],
    rows: withNetworkRow(
      [
        { label: 'Operation', value: 'Mint' },
        ...(input.assetName && input.assetTicker
          ? [{ label: 'Asset', value: `${input.assetName} (${input.assetTicker})` }]
          : input.assetTicker
            ? [{ label: 'Asset', value: input.assetTicker }]
            : []),
        ...(input.assetClass ? [{ label: 'Asset class', value: input.assetClass }] : []),
        { label: 'Amount', value: amountLabel },
        { label: 'Target', value: input.recipient, mono: true },
        ...(input.signerAddress
          ? [{ label: 'Signer', value: truncateAddress(input.signerAddress), mono: true }]
          : []),
      ],
      input.network,
    ),
  };
}

/** Build the review summary for a whitelist add/remove action. */
export function buildWhitelistSummary(input: WhitelistSummaryInput): TransactionDetails {
  const isAdd = input.action === 'add';

  return {
    action: 'whitelist',
    title: isAdd ? 'Add address to KYC whitelist' : 'Remove address from KYC whitelist',
    description: isAdd
      ? 'This grants the address permission to hold and receive this asset.'
      : 'This revokes the address\u2019s permission to hold or receive this asset.',
    network: input.network ?? undefined,
    expectedResult: isAdd
      ? 'The address becomes eligible to hold and receive the asset at the protocol level.'
      : 'The address loses protocol permission to hold or receive the asset.',
    riskNotes: [
      withDisclaimer(
        isAdd
          ? 'Whitelisting is a protocol permission change only.'
          : 'Revoking whitelist status may prevent the address from receiving further transfers.',
      ),
      SHARED_NETWORK_RISK,
      SHARED_SIGNATURE_RISK,
    ],
    rows: withNetworkRow(
      [
        { label: 'Operation', value: isAdd ? 'Whitelist add' : 'Whitelist revoke' },
        { label: 'Target', value: input.address, mono: true },
        { label: 'Action', value: isAdd ? 'Whitelist' : 'Revoke' },
        ...(input.note ? [{ label: 'Note', value: input.note }] : []),
      ],
      input.network,
    ),
  };
}

/** Build the review summary for a bulk compliance update. */
export function buildComplianceUpdateSummary(
  input: ComplianceUpdateSummaryInput,
): TransactionDetails {
  const { subjects, actionLabel } = input;

  return {
    action: 'compliance-update',
    title: 'Review compliance update',
    description: withDisclaimer(
      `Review ${actionLabel.toLowerCase()} action for ${subjects.length} subject(s).`,
    ),
    network: input.network ?? undefined,
    expectedResult: `Selected subjects receive the "${actionLabel}" protocol compliance action if the update is accepted.`,
    riskNotes: [
      'This changes protocol-level compliance state for every selected subject.',
      SHARED_NETWORK_RISK,
      SHARED_SIGNATURE_RISK,
    ],
    rows: withNetworkRow(
      [
        { label: 'Operation', value: 'Compliance update' },
        { label: 'Action', value: actionLabel },
        { label: 'Selected subjects', value: String(subjects.length) },
        ...subjects.slice(0, 5).map((subject, index) => ({
          label: `Target ${index + 1}`,
          value: truncateAddress(subject.id),
          mono: true,
        })),
        ...(subjects.length > 5
          ? [{ label: 'Additional targets', value: `\u2026 and ${subjects.length - 5} more` }]
          : []),
      ],
      input.network,
    ),
  };
}
