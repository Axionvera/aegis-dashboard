/**
 * AssetRegistrationForm – multi-step form for issuer asset registration.
 *
 * Steps:
 *   1. Input  – issuer fills out metadata fields
 *   2. Review – read-only summary before signing
 *   3. Receipt – success or error result
 *
 * The form is self-contained so it can be embedded anywhere or used as the
 * sole content of the /register-asset page.
 */

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import {
  validateAssetMetadata,
  fieldError,
  type AssetMetadata,
  type ValidationError,
} from '@/lib/validateAssetMetadata';
import {
  registerAsset,
  type RegisterAssetResult,
  type SdkError,
} from '@/lib/aegisSdk';
import ReviewStep from '@/components/ReviewStep';
import { SuccessReceipt, ErrorReceipt } from '@/components/RegistrationReceipt';
import { ASSET_TYPE_OPTIONS } from '@/fixtures/assetFixtures';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = 'input' | 'review' | 'receipt';

const EMPTY_FORM: AssetMetadata = {
  name: '',
  ticker: '',
  assetType: '',
  totalSupply: '',
  documentUri: '',
  jurisdiction: '',
  description: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssetRegistrationForm() {
  const { address } = useWallet();
  const [step, setStep] = useState<Step>('input');
  const [form, setForm] = useState<AssetMetadata>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RegisterAssetResult | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field on change
    setErrors((prev) => prev.filter((err) => err.field !== name));
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateAssetMetadata(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors([]);
    setStep('review');
  }

  async function handleSubmit() {
    if (!address) return;
    setIsSubmitting(true);
    setSdkError(null);
    try {
      const res = await registerAsset({ metadata: form, issuerAddress: address });
      setResult(res);
      setStep('receipt');
    } catch (err) {
      const sdkErr = err as SdkError;
      setSdkError(sdkErr.message ?? 'An unexpected error occurred. Please try again.');
      setStep('receipt');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    setSdkError(null);
    setResult(null);
    setStep('review');
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (step === 'review') {
    return (
      <ReviewStep
        metadata={form}
        issuerAddress={address!}
        onConfirm={handleSubmit}
        onBack={() => setStep('input')}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (step === 'receipt') {
    if (result) {
      return (
        <SuccessReceipt result={result} assetName={form.name} ticker={form.ticker} />
      );
    }
    return <ErrorReceipt message={sdkError ?? 'Unknown error.'} onRetry={handleRetry} />;
  }

  // ----- Input step -----
  return (
    <form onSubmit={handleReview} noValidate className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Asset Name */}
        <Field
          label="Asset Name"
          hint="Full name of the real-world asset"
          error={fieldError(errors, 'name')}
          required
        >
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Manhattan Commercial Real Estate"
            className={inputCls(!!fieldError(errors, 'name'))}
          />
        </Field>

        {/* Ticker */}
        <Field
          label="Ticker Symbol"
          hint="2-12 uppercase letters/digits/hyphens"
          error={fieldError(errors, 'ticker')}
          required
        >
          <input
            name="ticker"
            type="text"
            value={form.ticker}
            onChange={handleChange}
            placeholder="NY-CRE"
            className={inputCls(!!fieldError(errors, 'ticker'))}
            style={{ textTransform: 'uppercase' }}
          />
        </Field>

        {/* Asset Type */}
        <Field
          label="Asset Type"
          error={fieldError(errors, 'assetType')}
          required
        >
          <select
            name="assetType"
            value={form.assetType}
            onChange={handleChange}
            className={inputCls(!!fieldError(errors, 'assetType'))}
          >
            <option value="">Select a type…</option>
            {ASSET_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Total Supply */}
        <Field
          label="Total Supply"
          hint="Whole number of tokens to issue"
          error={fieldError(errors, 'totalSupply')}
          required
        >
          <input
            name="totalSupply"
            type="number"
            min="1"
            step="1"
            value={form.totalSupply}
            onChange={handleChange}
            placeholder="10000"
            className={inputCls(!!fieldError(errors, 'totalSupply'))}
          />
        </Field>

        {/* Jurisdiction */}
        <Field
          label="Jurisdiction"
          hint="ISO-3166-1 alpha-2 country code (e.g. US)"
          error={fieldError(errors, 'jurisdiction')}
          required
        >
          <input
            name="jurisdiction"
            type="text"
            maxLength={2}
            value={form.jurisdiction}
            onChange={handleChange}
            placeholder="US"
            className={inputCls(!!fieldError(errors, 'jurisdiction'))}
            style={{ textTransform: 'uppercase' }}
          />
        </Field>

        {/* Document URI */}
        <Field
          label="Document URI"
          hint="IPFS CID or HTTPS link to the offering document"
          error={fieldError(errors, 'documentUri')}
          required
        >
          <input
            name="documentUri"
            type="text"
            value={form.documentUri}
            onChange={handleChange}
            placeholder="ipfs://bafybei… or https://…"
            className={inputCls(!!fieldError(errors, 'documentUri'))}
          />
        </Field>
      </div>

      {/* Description (full width) */}
      <Field
        label="Description"
        hint="Optional — max 500 characters"
        error={fieldError(errors, 'description')}
      >
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Briefly describe the asset for prospective investors…"
          className={inputCls(!!fieldError(errors, 'description'))}
        />
      </Field>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 leading-relaxed">
        Submitting this form does not constitute legal verification or regulatory approval of the
        underlying asset. Ensure all submitted information complies with applicable laws in your
        jurisdiction.
      </p>

      <button
        type="submit"
        className="w-full bg-aegis-brand hover:bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm transition shadow-sm"
      >
        Review Registration →
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    'w-full border rounded-lg p-2.5 text-sm outline-none transition',
    'focus:ring-2 focus:ring-aegis-brand',
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-300'
      : 'border-slate-300 bg-white',
  ].join(' ');
}
