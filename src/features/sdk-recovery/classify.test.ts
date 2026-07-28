import { describe, expect, it } from 'vitest';
import { classifySdkError, redactDetail } from '@/features/sdk-recovery/classify';
import { SDK_ERROR_FIXTURES, getSdkErrorFixture } from '@/features/sdk-recovery/fixtures';

describe('classifySdkError — fixture coverage', () => {
  it.each(SDK_ERROR_FIXTURES.map((fixture) => [fixture.id, fixture] as const))(
    'classifies %s',
    (_id, fixture) => {
      expect(classifySdkError(fixture.failure, fixture.context).category).toBe(fixture.expected);
    },
  );

  it('covers every fixture id uniquely', () => {
    const ids = SDK_ERROR_FIXTURES.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('classifySdkError — context wins over message sniffing', () => {
  it('prefers a known-disconnected wallet over the error text', () => {
    const result = classifySdkError(new TypeError('Failed to fetch'), { walletConnected: false });
    expect(result.category).toBe('wallet_unavailable');
  });

  it('prefers a known network mismatch over the error text', () => {
    const result = classifySdkError(new Error('Rate limit exceeded'), { networkMatches: false });
    expect(result.category).toBe('network_mismatch');
  });

  it('falls back to sniffing when context is satisfied', () => {
    const result = classifySdkError(new Error('Rate limit exceeded'), {
      walletConnected: true,
      networkMatches: true,
    });
    expect(result.category).toBe('rate_limited');
  });
});

describe('classifySdkError — side-effect risk', () => {
  it('reports no risk for failures that never left the client', () => {
    expect(classifySdkError(new Error('User declined the request')).sideEffectRisk).toBe('none');
    expect(
      classifySdkError({ status: 'FAILED', errorMessage: 'Invalid destination address' })
        .sideEffectRisk,
    ).toBe('none');
  });

  it('reports possible risk for timeouts and unreachable endpoints', () => {
    expect(classifySdkError(new Error('The request timed out')).sideEffectRisk).toBe('possible');
    expect(classifySdkError(new TypeError('Failed to fetch')).sideEffectRisk).toBe('possible');
  });

  it('reports confirmed risk when an indeterminate response carries a hash', () => {
    const result = classifySdkError({ status: 'NOT_FOUND', hash: 'abc123' });
    expect(result.category).toBe('indeterminate');
    expect(result.sideEffectRisk).toBe('confirmed');
    expect(result.txHash).toBe('abc123');
  });

  it('never reports no-risk once a hash is present', () => {
    const result = classifySdkError({
      status: 'FAILED',
      hash: 'abc123',
      errorMessage: 'Recipient account is not authorised to hold this asset.',
    });
    expect(result.category).toBe('compliance_blocked');
    expect(result.sideEffectRisk).toBe('possible');
  });

  it('treats unknown failures as possibly applied', () => {
    expect(classifySdkError(null).sideEffectRisk).toBe('possible');
  });
});

describe('classifySdkError — retriability', () => {
  it('marks transport-level failures retriable', () => {
    expect(classifySdkError(new TypeError('Failed to fetch')).retriable).toBe(true);
    expect(classifySdkError({ code: 429 }).retriable).toBe(true);
  });

  it('does not mark deterministic refusals retriable', () => {
    expect(classifySdkError(new Error('Invalid destination address')).retriable).toBe(false);
    expect(
      classifySdkError(getSdkErrorFixture('compliance-blocked').failure).retriable,
    ).toBe(false);
    expect(classifySdkError(getSdkErrorFixture('insufficient-funds').failure).retriable).toBe(false);
  });

  it('does not mark indeterminate outcomes retriable', () => {
    expect(classifySdkError({ status: 'NOT_FOUND', hash: 'abc123' }).retriable).toBe(false);
  });
});

describe('classifySdkError — detail handling', () => {
  it('keeps a redacted detail line', () => {
    const result = classifySdkError(new Error('Invalid destination address: GXXX'));
    expect(result.detail).toContain('Invalid destination address');
  });

  it('omits the detail when it only repeats the headline', () => {
    const result = classifySdkError('Something went wrong');
    expect(result.category).toBe('unknown');
    expect(result.detail).toBeUndefined();
  });

  it('reads codes from numeric and string fields', () => {
    expect(classifySdkError({ code: 503 }).code).toBe('503');
    expect(classifySdkError({ status: 'TRY_AGAIN_LATER' }).code).toBe('TRY_AGAIN_LATER');
  });

  it('preserves the original value for diagnostics', () => {
    const failure = new Error('boom');
    expect(classifySdkError(failure).raw).toBe(failure);
  });
});

describe('redactDetail', () => {
  it('replaces URLs', () => {
    expect(redactDetail('Request to https://rpc.example.com/soroban failed')).toBe(
      'Request to [link] failed',
    );
  });

  it('truncates Stellar addresses', () => {
    const address = 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ';
    const detail = redactDetail(`Account ${address} is not funded`);

    expect(detail).toContain(`${address.slice(0, 4)}...${address.slice(-4)}`);
    expect(detail).not.toContain(address);
  });

  it('redacts secret-looking values', () => {
    expect(redactDetail('api_key: sk-live-123')).toBe('api_key: [redacted]');
  });

  it('caps long messages', () => {
    expect(redactDetail('x'.repeat(500)).length).toBeLessThanOrEqual(180);
  });
});
