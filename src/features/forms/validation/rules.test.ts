import { describe, expect, it } from 'vitest';
import {
  maxLength,
  minLength,
  notIn,
  numberInRange,
  oneOf,
  pattern,
  required,
  validateField,
  validateForm,
} from './rules';

describe('required', () => {
  it('fails on empty or whitespace-only values', () => {
    expect(required('req')('')).toBe('req');
    expect(required('req')('   ')).toBe('req');
  });

  it('passes when a value is present', () => {
    expect(required('req')('hello')).toBeUndefined();
  });

  it('uses a default message when none is given', () => {
    expect(required()('')).toBe('This field is required.');
  });
});

describe('minLength / maxLength', () => {
  it('minLength fails below the threshold but passes on empty (defers to required)', () => {
    expect(minLength(3, 'too short')('ab')).toBe('too short');
    expect(minLength(3, 'too short')('abc')).toBeUndefined();
    expect(minLength(3, 'too short')('')).toBeUndefined();
  });

  it('maxLength fails above the threshold but passes on empty', () => {
    expect(maxLength(3, 'too long')('abcd')).toBe('too long');
    expect(maxLength(3, 'too long')('abc')).toBeUndefined();
    expect(maxLength(3, 'too long')('')).toBeUndefined();
  });
});

describe('pattern', () => {
  const ticker = pattern(/^[A-Z0-9]{2,10}$/, 'bad ticker');

  it('fails when the value does not match', () => {
    expect(ticker('ny-cre!')).toBe('bad ticker');
  });

  it('passes when the value matches, and passes on empty', () => {
    expect(ticker('NYCRE')).toBeUndefined();
    expect(ticker('')).toBeUndefined();
  });
});

describe('numberInRange', () => {
  it('rejects non-numeric input', () => {
    expect(numberInRange(0)('abc')).toBe('Enter a valid number.');
  });

  it('enforces the lower bound', () => {
    expect(numberInRange(1)('0')).toBe('Must be at least 1.');
    expect(numberInRange(1)('1')).toBeUndefined();
  });

  it('enforces the upper bound when provided', () => {
    expect(numberInRange(0, 100)('101')).toBe('Must be no more than 100.');
    expect(numberInRange(0, 100)('100')).toBeUndefined();
  });

  it('has no upper bound when max is omitted', () => {
    expect(numberInRange(0)('1000000')).toBeUndefined();
  });

  it('passes on empty, deferring to required', () => {
    expect(numberInRange(0, 100)('')).toBeUndefined();
  });
});

describe('notIn', () => {
  it('rejects case-insensitive, trimmed duplicates', () => {
    const rule = notIn(['NY-CRE', 'UST-6M'], 'duplicate');
    expect(rule('ny-cre')).toBe('duplicate');
    expect(rule('  NY-CRE  ')).toBe('duplicate');
    expect(rule('NEW-TICKER')).toBeUndefined();
  });
});

describe('oneOf', () => {
  const rule = oneOf(['US', 'EU', 'SG'], 'unsupported');

  it('rejects values not in the option list', () => {
    expect(rule('FR')).toBe('unsupported');
  });

  it('accepts values in the option list, and passes on empty', () => {
    expect(rule('US')).toBeUndefined();
    expect(rule('')).toBeUndefined();
  });
});

describe('validateField', () => {
  it('returns the first failing rule and stops (does not run later rules)', () => {
    let secondRuleRan = false;
    const rules = [
      required('required'),
      () => {
        secondRuleRan = true;
        return 'second';
      },
    ];
    expect(validateField('', rules)).toBe('required');
    expect(secondRuleRan).toBe(false);
  });

  it('returns undefined when every rule passes', () => {
    expect(validateField('abc', [required(), minLength(2)])).toBeUndefined();
  });
});

describe('validateForm', () => {
  type Field = 'assetName' | 'ticker';

  const schema: Partial<Record<Field, ReturnType<typeof required>[]>> = {
    assetName: [required('Name required'), minLength(3, 'Name too short')],
    ticker: [required('Ticker required'), pattern(/^[A-Z0-9]{2,10}$/, 'Bad ticker')],
  };

  it('collects one error per invalid field and reports isValid: false', () => {
    const { errors, isValid } = validateForm<Field>({ assetName: 'ab', ticker: '' }, schema);
    expect(errors).toEqual({ assetName: 'Name too short', ticker: 'Ticker required' });
    expect(isValid).toBe(false);
  });

  it('omits passing fields from the errors object entirely', () => {
    const { errors } = validateForm<Field>(
      { assetName: 'Manhattan CRE', ticker: '' },
      schema,
    );
    expect('assetName' in errors).toBe(false);
    expect(errors.ticker).toBe('Ticker required');
  });

  it('reports isValid: true and an empty errors object when everything passes', () => {
    const { errors, isValid } = validateForm<Field>(
      { assetName: 'Manhattan CRE', ticker: 'NYCRE' },
      schema,
    );
    expect(errors).toEqual({});
    expect(isValid).toBe(true);
  });
});
