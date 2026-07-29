import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFormErrors } from './useFormErrors';

type Fields = 'assetName' | 'ticker';

describe('useFormErrors', () => {
  it('starts with no errors', () => {
    const { result } = renderHook(() => useFormErrors<Fields>());
    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
    expect(result.current.errorFor('ticker')).toBeUndefined();
  });

  it('setFieldError sets a single field and leaves others untouched', () => {
    const { result } = renderHook(() => useFormErrors<Fields>());

    act(() => result.current.setFieldError('ticker', 'Bad ticker'));

    expect(result.current.errorFor('ticker')).toBe('Bad ticker');
    expect(result.current.errorFor('assetName')).toBeUndefined();
    expect(result.current.hasErrors).toBe(true);
  });

  it('setFieldError with undefined clears that field only', () => {
    const { result } = renderHook(() => useFormErrors<Fields>());

    act(() => {
      result.current.setFieldError('ticker', 'Bad ticker');
      result.current.setFieldError('assetName', 'Too short');
    });
    act(() => result.current.setFieldError('ticker', undefined));

    expect(result.current.errorFor('ticker')).toBeUndefined();
    expect(result.current.errorFor('assetName')).toBe('Too short');
    expect(result.current.hasErrors).toBe(true);
  });

  it('clearFieldError removes a single field error', () => {
    const { result } = renderHook(() => useFormErrors<Fields>());

    act(() => result.current.setFieldError('assetName', 'Too short'));
    act(() => result.current.clearFieldError('assetName'));

    expect(result.current.errorFor('assetName')).toBeUndefined();
    expect(result.current.hasErrors).toBe(false);
  });

  it('setErrors replaces the whole map (e.g. from validateForm)', () => {
    const { result } = renderHook(() => useFormErrors<Fields>());

    act(() => result.current.setErrors({ ticker: 'Bad ticker', assetName: 'Too short' }));

    expect(result.current.errors).toEqual({ ticker: 'Bad ticker', assetName: 'Too short' });
    expect(result.current.hasErrors).toBe(true);
  });

  it('clearAll removes every error', () => {
    const { result } = renderHook(() => useFormErrors<Fields>());

    act(() => result.current.setErrors({ ticker: 'Bad ticker', assetName: 'Too short' }));
    act(() => result.current.clearAll());

    expect(result.current.errors).toEqual({});
    expect(result.current.hasErrors).toBe(false);
  });
});
