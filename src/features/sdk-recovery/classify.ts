import type {
  ClassifiedSdkError,
  SdkErrorCategory,
  SideEffectRisk,
} from '@/features/sdk-recovery/types';

/**
 * Turns anything an SDK call can produce — a thrown `Error`, a rejected
 * promise value, an RPC envelope, a bare status string, `null` — into a single
 * `ClassifiedSdkError`.
 *
 * Fail-closed rules:
 *  - An unrecognised failure is `unknown`, not "probably retriable".
 *  - Anything that carries a transaction hash is assumed to have reached the
 *    network, so its side-effect risk is never `none`.
 */

/** Categories that never reached the network, so a plain retry is safe. */
const NO_SIDE_EFFECT: SdkErrorCategory[] = [
  'wallet_unavailable',
  'wallet_rejected',
  'network_mismatch',
  'invalid_input',
  'compliance_blocked',
];

/** Categories where the same call is worth running again. */
const RETRIABLE: SdkErrorCategory[] = [
  'wallet_unavailable',
  'wallet_rejected',
  'network_unreachable',
  'timeout',
  'rate_limited',
];

const MESSAGES: Record<SdkErrorCategory, string> = {
  wallet_unavailable: 'Wallet not available',
  wallet_rejected: 'Signature declined',
  network_mismatch: 'Wrong wallet network',
  network_unreachable: 'Network unreachable',
  timeout: 'The request timed out',
  rate_limited: 'Too many requests',
  compliance_blocked: 'Blocked by compliance rules',
  insufficient_funds: 'Insufficient balance',
  invalid_input: 'The request was rejected as invalid',
  indeterminate: 'Outcome could not be confirmed',
  unknown: 'Something went wrong',
};

/**
 * Substring probes, most specific first. Ordering matters: "user rejected the
 * request because the account is not authorised" must classify as a rejection
 * only if no more specific probe matched earlier.
 */
const PATTERNS: Array<{ category: SdkErrorCategory; probes: RegExp }> = [
  {
    category: 'wallet_rejected',
    probes: /(user (declined|rejected|denied|cancelled|canceled))|(request rejected by user)|(signature (declined|rejected))|(action_rejected)/i,
  },
  {
    category: 'wallet_unavailable',
    probes: /(freighter (is )?(not|isn't) (installed|available|detected))|(wallet (is )?(locked|not connected|unavailable))|(no wallet)|(install freighter)|(user_not_signed_in)/i,
  },
  {
    category: 'network_mismatch',
    probes: /(wrong network)|(network mismatch)|(unsupported network)|(switch (your )?network)|(expected network)|(passphrase mismatch)/i,
  },
  {
    category: 'rate_limited',
    probes: /(rate.?limit)|(too many requests)|\b429\b|(try_again_later)|(throttl)/i,
  },
  {
    category: 'timeout',
    probes: /(timed? ?out)|(timeout)|(deadline exceeded)|(aborted)|(abort_?error)/i,
  },
  {
    category: 'compliance_blocked',
    probes: /(not (kyc )?whitelisted)|(compliance)|(not authori[sz]ed)|(restricted|forbidden|unauthorized)|\b40[13]\b|(accreditation)/i,
  },
  {
    category: 'insufficient_funds',
    probes: /(insufficient (funds|balance|fee|reserve))|(underfunded)|(tx_insufficient_balance)/i,
  },
  {
    category: 'invalid_input',
    probes: /(invalid (address|amount|argument|input|destination))|(malformed)|(bad_seq)|(tx_bad_seq)|(is required)|\b400\b/i,
  },
  {
    category: 'network_unreachable',
    probes: /(failed to fetch)|(network ?error)|(networkerror)|(econnrefused)|(enotfound)|(dns)|(offline)|(cors)|(unable to reach)|\b5\d{2}\b|(bad gateway)|(service unavailable)/i,
  },
  {
    category: 'indeterminate',
    probes: /(not_?found)|(unknown status)|(status unavailable)|(could ?n[o']t confirm)|(pending)/i,
  },
];

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const asText = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value instanceof Error && value.message.trim()) return value.message.trim();
  const record = asRecord(value);
  if (record && typeof record.message === 'string' && record.message.trim()) {
    return record.message.trim();
  }
  return undefined;
};

const asHash = (record: Record<string, unknown> | null): string | undefined => {
  if (!record) return undefined;
  for (const key of ['hash', 'txHash', 'transactionHash']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
};

const asCode = (record: Record<string, unknown> | null): string | undefined => {
  if (!record) return undefined;
  for (const key of ['code', 'status', 'statusCode', 'errorCode']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
};

const MAX_DETAIL_LENGTH = 180;

/**
 * Detail text is written by the SDK/RPC, so it can carry addresses and URLs.
 * We keep it short and strip anything that looks like a secret or a full URL
 * before it reaches the DOM, matching the redaction posture in
 * `src/lib/diagnostics/redact.ts`.
 */
export const redactDetail = (text: string): string => {
  const cleaned = text
    .replace(/\bhttps?:\/\/\S+/gi, '[link]')
    .replace(/\b[SG][A-Z2-7]{20,}\b/g, (match) => `${match.slice(0, 4)}...${match.slice(-4)}`)
    .replace(/\b(secret|seed|api[_-]?key|token)\b\s*[:=]\s*\S+/gi, '$1: [redacted]')
    .trim();

  return cleaned.length > MAX_DETAIL_LENGTH
    ? `${cleaned.slice(0, MAX_DETAIL_LENGTH - 1).trimEnd()}…`
    : cleaned;
};

const matchCategory = (haystack: string): SdkErrorCategory | null => {
  for (const { category, probes } of PATTERNS) {
    if (probes.test(haystack)) return category;
  }
  return null;
};

const resolveSideEffectRisk = (
  category: SdkErrorCategory,
  hasHash: boolean,
): SideEffectRisk => {
  if (hasHash) return category === 'indeterminate' ? 'confirmed' : 'possible';
  if (NO_SIDE_EFFECT.includes(category)) return 'none';
  // Timeouts, unreachable networks and unknown failures can all happen *after*
  // the request left the browser, so a resubmission could double-apply.
  return 'possible';
};

/**
 * Classify a failure from the Aegis SDK.
 *
 * @param failure Anything the call produced: thrown error, rejected value,
 *   RPC envelope (`{ status, error, errorMessage, hash }`) or status string.
 * @param context Optional hints the caller already knows, e.g. that the wallet
 *   is disconnected. Explicit hints win over message sniffing.
 */
export const classifySdkError = (
  failure: unknown,
  context: { walletConnected?: boolean; networkMatches?: boolean } = {},
): ClassifiedSdkError => {
  const record = asRecord(failure);
  const txHash = asHash(record);
  const code = asCode(record);

  const rawText =
    asText(failure) ??
    asText(record?.error) ??
    asText(record?.errorMessage) ??
    (typeof record?.status === 'string' ? record.status : undefined);

  let category: SdkErrorCategory | null = null;

  // Caller-supplied context is authoritative — it reflects live wallet state
  // rather than a string the SDK happened to include.
  if (context.walletConnected === false) {
    category = 'wallet_unavailable';
  } else if (context.networkMatches === false) {
    category = 'network_mismatch';
  } else {
    const haystack = [rawText, code].filter(Boolean).join(' ');
    category = haystack ? matchCategory(haystack) : null;
  }

  if (!category) {
    // A hash with no recognisable error means it went out and we can't tell
    // what happened; anything else with no signal at all stays `unknown`.
    category = txHash ? 'indeterminate' : 'unknown';
  }

  const detail = rawText ? redactDetail(rawText) : undefined;

  return {
    category,
    retriable: RETRIABLE.includes(category),
    sideEffectRisk: resolveSideEffectRisk(category, Boolean(txHash)),
    message: MESSAGES[category],
    detail: detail && detail !== MESSAGES[category] ? detail : undefined,
    txHash,
    code,
    raw: failure,
  };
};
