/**
 * Reusable, composable field validation rules.
 *
 * Each helper *returns* a `ValidationRule` (a function), so rules read
 * declaratively at the call site:
 *
 *   validateField(assetName, [required('Asset name is required.'), minLength(3, '...')])
 *
 * @see docs/form-validation-framework.md
 */
import type { ValidationRule } from './types';

/** Fails when the (trimmed) value is empty. */
export function required(message = 'This field is required.'): ValidationRule<string> {
  return (value) => (value.trim() ? undefined : message);
}

/** Fails when the (trimmed) value is shorter than `min` characters. Passes on empty — pair with `required`. */
export function minLength(min: number, message?: string): ValidationRule<string> {
  return (value) => {
    const v = value.trim();
    if (!v) return undefined;
    return v.length < min ? message ?? `Must be at least ${min} characters.` : undefined;
  };
}

/** Fails when the (trimmed) value is longer than `max` characters. Passes on empty — pair with `required`. */
export function maxLength(max: number, message?: string): ValidationRule<string> {
  return (value) => {
    const v = value.trim();
    if (!v) return undefined;
    return v.length > max ? message ?? `Must be no more than ${max} characters.` : undefined;
  };
}

/** Fails when the (trimmed) value doesn't match `regex`. Passes on empty — pair with `required`. */
export function pattern(regex: RegExp, message: string): ValidationRule<string> {
  return (value) => {
    const v = value.trim();
    if (!v) return undefined;
    return regex.test(v) ? undefined : message;
  };
}

/**
 * Fails when the value doesn't parse as a finite number in the given range.
 * `max` is optional (no upper bound if omitted). Passes on empty — pair with `required`.
 */
export function numberInRange(
  min: number,
  max?: number,
  message?: string,
): ValidationRule<string> {
  return (value) => {
    const v = value.trim();
    if (!v) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) return message ?? 'Enter a valid number.';
    if (n < min) return message ?? `Must be at least ${min}.`;
    if (max !== undefined && n > max) return message ?? `Must be no more than ${max}.`;
    return undefined;
  };
}

/** Fails when the (case-insensitive, trimmed) value is already present in `values`. */
export function notIn(values: string[], message: string): ValidationRule<string> {
  const lowered = values.map((v) => v.trim().toLowerCase());
  return (value) => {
    const v = value.trim().toLowerCase();
    if (!v) return undefined;
    return lowered.includes(v) ? message : undefined;
  };
}

/** Fails when the (trimmed) value isn't one of `options` (case-sensitive). Passes on empty — pair with `required`. */
export function oneOf(options: readonly string[], message: string): ValidationRule<string> {
  return (value) => {
    const v = value.trim();
    if (!v) return undefined;
    return (options as string[]).includes(v) ? undefined : message;
  };
}

/**
 * Runs `rules` in order against `value` and returns the first failure
 * message, or `undefined` if every rule passes.
 */
export function validateField<TValue>(
  value: TValue,
  rules: ValidationRule<TValue>[],
): string | undefined {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return undefined;
}

/**
 * Validates a whole form in one pass. `schema` maps each field name to the
 * rules that apply to it. Returns a `FieldErrors` object containing only
 * the fields that failed (fields that passed are omitted, not set to
 * `undefined`), plus a convenience `isValid` flag.
 *
 * `TFields` is the union of field-name string literals (e.g.
 * `'assetName' | 'ticker'`), not the form's value interface — this keeps the
 * helper usable with any plain string-keyed form values.
 */
export function validateForm<TFields extends string>(
  values: Record<TFields, string>,
  schema: Partial<Record<TFields, ValidationRule<string>[]>>,
): { errors: Partial<Record<TFields, string>>; isValid: boolean } {
  const errors: Partial<Record<TFields, string>> = {};

  for (const field in schema) {
    const key = field as TFields;
    const rules = schema[key];
    if (!rules) continue;
    const error = validateField(values[key], rules);
    if (error) errors[key] = error;
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
