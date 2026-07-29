# Shared form validation framework

Closes #183.

Before this, each dashboard form (asset registration, compliance/whitelist
actions, minting) rolled its own validation and its own error markup —
one global banner in some forms, an ad-hoc field message in others,
different icons, different wording for "this field is required." The
shared framework in `src/features/forms/validation/` gives every form the
same building blocks so validation logic and error display look and behave
the same way everywhere.

It does **not** replace the existing per-domain validators
(`assetCreationRequest.ts`, `whitelist.ts`, `mintRequest.ts`) — those still
own the business rules for their domain (ticker format, duplicate checks,
compliance guards, etc). This framework standardizes how *any* form —
including those — tracks and displays field errors.

## What's in the module

| File | Purpose |
| --- | --- |
| `types.ts` | `FieldErrors`, `ValidationRule` — the shared shapes. |
| `rules.ts` | Composable rule builders (`required`, `minLength`, `maxLength`, `pattern`, `numberInRange`, `notIn`, `oneOf`) plus `validateField` / `validateForm` runners. |
| `useFormErrors.ts` | React hook that holds a form's `FieldErrors` state and exposes `setFieldError`, `clearFieldError`, `clearAll`, `errorFor`, `hasErrors`. |
| `FormFieldError.tsx` | Renders a single field's error message under its input (icon + red text, `role="alert"`). Renders nothing when there's no message. |
| `FormError.tsx` | Renders a form-level banner for errors that aren't tied to one field (e.g. a submit-time or async check failure). |

Everything is re-exported from `src/features/forms/validation/index.ts`.

## Using it in a new form

```tsx
import { useFormErrors, FormFieldError, FormError, validateForm, required, minLength, pattern } from '@/features/forms/validation';

type Field = 'name' | 'ticker';

function MyForm() {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [formError, setFormError] = useState('');
  const fieldErrors = useFormErrors<Field>();

  const handleSubmit = () => {
    const { errors, isValid } = validateForm<Field>(
      { name, ticker },
      {
        name: [required('Name is required.'), minLength(3, 'Name must be at least 3 characters.')],
        ticker: [required('Ticker is required.'), pattern(/^[A-Z0-9]{2,10}$/, 'Ticker must be 2-10 letters/numbers.')],
      },
    );

    fieldErrors.setErrors(errors);
    if (!isValid) return;

    // ...submit
  };

  return (
    <form>
      <FormError message={formError} />

      <label htmlFor="my-name">Name</label>
      <input id="my-name" value={name} onChange={(e) => setName(e.target.value)} />
      <FormFieldError message={fieldErrors.errorFor('name')} />

      <label htmlFor="my-ticker">Ticker</label>
      <input id="my-ticker" value={ticker} onChange={(e) => setTicker(e.target.value)} />
      <FormFieldError message={fieldErrors.errorFor('ticker')} />
    </form>
  );
}
```

## Adopting it in an existing form with its own validator

If a form already has a domain validator that returns one error code at a
time (like `validateAssetCreationRequest`), map each error code to the field
it belongs to and route it through `fieldErrors.setFieldError`, falling back
to the `FormError` banner for errors that aren't about a single field (e.g.
"fill in every field"). See `AssetCreationWizard.tsx` for a worked example
of this pattern (`ERROR_FIELD` map + `applyValidationError`).

## Where it's used today

- **`AssetCreationWizard`** (asset registration) — per-field errors for
  asset name, ticker, amount, and jurisdiction; a `FormError` banner for
  non-field-specific failures (e.g. missing fields).
- **`WhitelistManager`** (compliance/admin) — per-field error under the
  address input, replacing the previous single ad-hoc error paragraph.
- **`MintWorkflow`** (minting) — its submit-time and async compliance-check
  errors now render through the shared `FormError` banner instead of a
  one-off `<div>`, so the visual style matches every other form.

## Accessibility

- `FormFieldError` and `FormError` both use `role="alert"` so assistive
  technology announces new errors as they appear.
- Pass an `id` to `FormFieldError` and wire it to the input's
  `aria-describedby` (see the examples in `AssetCreationWizard.tsx` and
  `WhitelistManager.tsx`) so screen readers announce the specific error
  when the field is focused, not just when it first appears.

## Testing

`rules.test.ts` and `useFormErrors.test.ts` cover the pure logic and the
hook in isolation (no DOM needed for the rules; `@testing-library/react`'s
`renderHook` for the hook). Component-level tests for each form continue to
assert on the rendered error text/role as before — adopting the shared
framework didn't change any form's public behavior or copy, only how the
error state and markup are produced internally.
