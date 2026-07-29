import { AlertTriangle } from 'lucide-react';

export interface FormErrorProps {
  /** The error message to display. Renders nothing when `undefined`/empty. */
  message?: string;
}

/**
 * Consistent form-level error banner, for errors that aren't tied to a
 * single field (e.g. a submit-time failure, a duplicate-ticker rejection,
 * or an async check like compliance/whitelist status). Pair with
 * `FormFieldError` for individual field errors so every form in the
 * dashboard shows errors the same way.
 *
 * @see docs/form-validation-framework.md
 */
export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded bg-red-50 p-3 text-sm text-red-600"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
