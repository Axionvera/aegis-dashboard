import { describe, it, expect } from 'vitest';
import { redactUrl, redactContractId } from './redact';

describe('redactUrl', () => {
  it('redacts long paths which might be API keys', () => {
    expect(redactUrl('https://rpc.example.com/v1/1234567890abcdef1234567890')).toBe('https://rpc.example.com/v1/1...7890');
  });
  it('handles missing values', () => {
    expect(redactUrl('')).toBe('Not configured');
  });
  it('handles invalid urls', () => {
    expect(redactUrl('not_a_url')).toBe('Invalid URL');
  });
});

describe('redactContractId', () => {
  it('masks long strings', () => {
    expect(redactContractId('CABCDEFGHIJKLMNOPQRSTUVWXYZ123456')).toBe('CABC...3456');
  });
  it('handles missing values', () => {
    expect(redactContractId('')).toBe('Not configured');
  });
  it('returns short IDs as is', () => {
    expect(redactContractId('SHORT123')).toBe('SHORT123');
  });
});
