/**
 * Shared React hook for managing a form's field-level error state.
 *
 * Every form that adopts this framework gets the same API for reading and
 * clearing errors, so `FormFieldError` / `FormError` can be dropped in
 * without each form re-inventing its own error-state shape.
 *
 * @see docs/form-validation-framework.md
 */
import { useCallback, useMemo, useState } from 'react';
import type { FieldErrors } from './types';

export interface UseFormErrors<TFields extends string> {
  /** Current field -> message map. Only fields with an active error are present. */
  errors: FieldErrors<TFields>;
  /** Replaces the entire error map (e.g. with the result of `validateForm`). */
  setErrors: (errors: FieldErrors<TFields>) => void;
  /** Sets (or clears, when `message` is undefined) a single field's error. */
  setFieldError: (field: TFields, message: string | undefined) => void;
  /** Clears a single field's error, if any. */
  clearFieldError: (field: TFields) => void;
  /** Clears every field error. */
  clearAll: () => void;
  /** The error message for `field`, or `undefined` if it currently has none. */
  errorFor: (field: TFields) => string | undefined;
  /** True when at least one field currently has an error. */
  hasErrors: boolean;
}

/**
 * Manages a `FieldErrors` map for a form with fields `TFields`.
 *
 * @example
 * const form = useFormErrors<'assetName' | 'ticker'>();
 * const { errors, isValid } = validateForm(values, schema);
 * form.setErrors(errors);
 * // ...
 * <FormFieldError message={form.errorFor('ticker')} />
 */
export function useFormErrors<TFields extends string>(): UseFormErrors<TFields> {
  const [errors, setErrorsState] = useState<FieldErrors<TFields>>({});

  const setErrors = useCallback((next: FieldErrors<TFields>) => {
    setErrorsState(next);
  }, []);

  const setFieldError = useCallback((field: TFields, message: string | undefined) => {
    setErrorsState((prev) => {
      if (!message) {
        if (!(field in prev)) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  }, []);

  const clearFieldError = useCallback(
    (field: TFields) => setFieldError(field, undefined),
    [setFieldError],
  );

  const clearAll = useCallback(() => setErrorsState({}), []);

  const errorFor = useCallback((field: TFields) => errors[field], [errors]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return { errors, setErrors, setFieldError, clearFieldError, clearAll, errorFor, hasErrors };
}
