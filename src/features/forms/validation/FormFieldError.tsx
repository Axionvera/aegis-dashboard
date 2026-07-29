import { AlertTriangle } from 'lucide-react';

export interface FormFieldErrorProps {
  /** The error message to display. Renders nothing when `undefined`/empty. */
  message?: string;
  /** id to pair with the input's `aria-describedby`, for screen readers. */
  id?: string;
}

/**
 * Consistent inline field error, used under any labeled input across the
 * dashboard's forms (asset registration, compliance/whitelist actions,
 * minting, admin forms). Renders `null` when there's no message so callers
 * can render it unconditionally.
 *
 * @see docs/form-validation-framework.md
 */
export default function FormFieldError({ message, id }: FormFieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1 flex items-center gap-1.5 text-sm text-red-600">
      <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
