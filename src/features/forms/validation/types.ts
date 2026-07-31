/**
 * Shared form validation framework — core types.
 *
 * Framework-agnostic (no React) so rules can be unit-tested in isolation,
 * mirroring the pattern already used by assetCreationRequest.ts, whitelist.ts,
 * and mintRequest.ts. This module doesn't replace those per-domain validators
 * — it gives every form in the dashboard the same *shape* for field errors
 * and the same building blocks for writing new rules, so the display layer
 * (FormFieldError / FormError) and any future form can rely on one contract.
 *
 * @see docs/form-validation-framework.md
 */

/** Map of field name -> current error message (absent/undefined = no error). */
export type FieldErrors<TFields extends string = string> = Partial<Record<TFields, string>>;

/**
 * A single validation rule. Returns an error message when the value is
 * invalid, or `undefined` when it passes. Rules receive the *whole* field
 * value already trimmed by the caller where trimming makes sense — rules
 * themselves stay pure and synchronous.
 */
export type ValidationRule<TValue = string> = (value: TValue) => string | undefined;

/** Result of validating a single field: the first failing rule's message, if any. */
export type FieldValidationResult = string | undefined;
