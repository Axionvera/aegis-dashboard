import { useState } from 'react';
import {
  validateAssetCreationRequest,
  ASSET_CREATION_ERROR_MESSAGES,
  SUPPORTED_JURISDICTIONS,
  ASSET_CLASS_OPTIONS,
  type AssetCreationErrorCode,
} from '@/lib/assetCreationRequest';
import { useFormErrors, FormFieldError, FormError } from '@/features/forms/validation';
import {
  AdminActionReceiptView,
  mapAdminActionReceipt,
} from '@/features/admin/receipts';
import type { IssuanceRequest } from '@/fixtures/issuer';

type WizardStep = 'form' | 'review' | 'success';
type AssetCreationField = 'assetName' | 'ticker' | 'amount' | 'jurisdiction';

/**
 * `validateAssetCreationRequest` reports one error code at a time. Map each
 * code to the field it belongs to so it renders under the right input via
 * the shared `FormFieldError`; codes that aren't about a single field (e.g.
 * several fields left blank) fall back to the form-level `FormError` banner.
 */
const ERROR_FIELD: Partial<Record<AssetCreationErrorCode, AssetCreationField>> = {
  ASSET_NAME_TOO_SHORT: 'assetName',
  INVALID_TICKER: 'ticker',
  DUPLICATE_TICKER: 'ticker',
  NON_POSITIVE_AMOUNT: 'amount',
  AMOUNT_TOO_LARGE: 'amount',
  UNSUPPORTED_JURISDICTION: 'jurisdiction',
};

export interface AssetCreationWizardProps {
  /** Tickers already registered, for duplicate-ticker validation. */
  existingTickers?: string[];
  /** Address of the wallet submitting the request (falls back to a mock actor). */
  requestedBy?: string | null;
  /** Called with the new issuance request once the user confirms submission. */
  onCreate: (request: IssuanceRequest) => void;
  /** Called when the user cancels out of the wizard (e.g. closes the modal). */
  onCancel?: () => void;
}

let localSequence = 0;

/** Generates a synthetic issuance request id, e.g. ISS-005. Mock-mode only —
 * a live backend would assign this id server-side. */
function nextIssuanceId(existingCount: number): string {
  localSequence += 1;
  return `ISS-${String(existingCount + localSequence).padStart(3, '0')}`;
}

/**
 * Guided RWA asset creation wizard for the Issuer Console: enter asset
 * details → review → submit for compliance review. Creates a new
 * `IssuanceRequest` in `pending` status; it becomes mintable only after a
 * separate compliance approval step (existing Issuer Console lifecycle).
 * Closes #29.
 */
export default function AssetCreationWizard({
  existingTickers = [],
  requestedBy,
  onCreate,
  onCancel,
}: AssetCreationWizardProps) {
  const [step, setStep] = useState<WizardStep>('form');
  const [assetName, setAssetName] = useState('');
  const [ticker, setTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [jurisdiction, setJurisdiction] = useState<string>(SUPPORTED_JURISDICTIONS[0]);
  const [assetClass, setAssetClass] = useState<string>(ASSET_CLASS_OPTIONS[0]);
  const [formError, setFormError] = useState('');
  const [lastCreated, setLastCreated] = useState<IssuanceRequest | null>(null);
  const fieldErrors = useFormErrors<AssetCreationField>();

  /** Routes a validation error code to the right field or the form banner. */
  const applyValidationError = (code: AssetCreationErrorCode) => {
    const message = ASSET_CREATION_ERROR_MESSAGES[code];
    const field = ERROR_FIELD[code];
    if (field) {
      fieldErrors.clearAll();
      fieldErrors.setFieldError(field, message);
      setFormError('');
    } else {
      fieldErrors.clearAll();
      setFormError(message);
    }
  };

  const handleReview = () => {
    setFormError('');
    fieldErrors.clearAll();
    const validation = validateAssetCreationRequest(
      { assetName, ticker, amount, jurisdiction, assetClass },
      { existingTickers },
    );

    if (!validation.valid) {
      applyValidationError(validation.error!);
      return;
    }

    setStep('review');
  };

  const handleConfirm = () => {
    const validation = validateAssetCreationRequest(
      { assetName, ticker, amount, jurisdiction, assetClass },
      { existingTickers },
    );

    // Re-validate on confirm: existingTickers may have changed while the
    // user sat on the review screen (e.g. another request was created).
    if (!validation.valid || validation.parsedAmount === undefined) {
      applyValidationError(validation.error!);
      setStep('form');
      return;
    }

    const request: IssuanceRequest = {
      id: nextIssuanceId(existingTickers.length),
      assetName: assetName.trim(),
      ticker: validation.normalisedTicker!,
      amount: validation.parsedAmount,
      jurisdiction: jurisdiction.trim().toUpperCase(),
      status: 'pending',
      requestedAt: new Date().toISOString(),
      requestedBy: requestedBy ?? 'unknown-actor',
    };

    onCreate(request);
    setLastCreated(request);
    setStep('success');
  };

  const handleReset = () => {
    setAssetName('');
    setTicker('');
    setAmount('');
    setJurisdiction(SUPPORTED_JURISDICTIONS[0]);
    setAssetClass(ASSET_CLASS_OPTIONS[0]);
    setFormError('');
    fieldErrors.clearAll();
    setLastCreated(null);
    setStep('form');
  };

  if (step === 'success' && lastCreated) {
    const receipt = mapAdminActionReceipt({
      operation: 'asset-registration',
      target: lastCreated.ticker,
      outcome: { status: 'SUCCESS' },
      metadata: {
        asset: `${lastCreated.assetName} (${lastCreated.ticker})`,
        amount: lastCreated.amount.toLocaleString('en-US'),
        requestId: lastCreated.id,
      },
    });

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <AdminActionReceiptView
          receipt={receipt}
          onNextAction={handleReset}
          onClose={onCancel ?? handleReset}
        />
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Review issuance request</h2>
        <dl className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Asset name</dt>
            <dd className="font-medium text-slate-900">{assetName.trim()}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Ticker</dt>
            <dd className="font-medium text-slate-900 font-mono">
              {ticker.trim().toUpperCase()}
            </dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Asset class</dt>
            <dd className="font-medium text-slate-900">{assetClass}</dd>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <dt className="text-slate-500">Initial requested supply</dt>
            <dd className="font-medium text-slate-900">
              {Number(amount).toLocaleString('en-US')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Jurisdiction</dt>
            <dd className="font-medium text-slate-900">{jurisdiction.trim().toUpperCase()}</dd>
          </div>
        </dl>

        <FormError message={formError} />

        <p className="text-xs text-slate-500 mb-4">
          Submitting sends this asset for compliance review. This is a protocol-level
          compliance check only and is not legal or financial advice.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-aegis-dark hover:bg-slate-800 text-white py-2 rounded font-medium transition"
          >
            Submit for review
          </button>
          <button
            type="button"
            onClick={() => setStep('form')}
            className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded font-medium transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-2">New RWA asset request</h2>
      <p className="text-sm text-slate-500 mb-6">
        Register a new RWA asset for compliance review. It becomes mintable only after
        approval — this does not mint supply directly.
      </p>

      <FormError message={formError} />

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="ac-asset-name" className="block text-sm font-medium text-slate-700 mb-1">
            Asset name
          </label>
          <input
            id="ac-asset-name"
            type="text"
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
            placeholder="Manhattan Commercial Real Estate"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            aria-describedby={fieldErrors.errorFor('assetName') ? 'ac-asset-name-error' : undefined}
          />
          <FormFieldError id="ac-asset-name-error" message={fieldErrors.errorFor('assetName')} />
        </div>

        <div>
          <label htmlFor="ac-ticker" className="block text-sm font-medium text-slate-700 mb-1">
            Ticker
          </label>
          <input
            id="ac-ticker"
            type="text"
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none font-mono"
            placeholder="NY-CRE"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={fieldErrors.errorFor('ticker') ? 'ac-ticker-error' : undefined}
          />
          <FormFieldError id="ac-ticker-error" message={fieldErrors.errorFor('ticker')} />
        </div>

        <div>
          <label htmlFor="ac-asset-class" className="block text-sm font-medium text-slate-700 mb-1">
            Asset class
          </label>
          <select
            id="ac-asset-class"
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none bg-white"
            value={assetClass}
            onChange={(e) => setAssetClass(e.target.value)}
          >
            {ASSET_CLASS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ac-amount" className="block text-sm font-medium text-slate-700 mb-1">
            Initial requested supply
          </label>
          <input
            id="ac-amount"
            type="number"
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none"
            placeholder="100000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
            aria-describedby={fieldErrors.errorFor('amount') ? 'ac-amount-error' : undefined}
          />
          <FormFieldError id="ac-amount-error" message={fieldErrors.errorFor('amount')} />
        </div>

        <div>
          <label htmlFor="ac-jurisdiction" className="block text-sm font-medium text-slate-700 mb-1">
            Jurisdiction
          </label>
          <select
            id="ac-jurisdiction"
            className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-aegis-brand outline-none bg-white"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            aria-describedby={
              fieldErrors.errorFor('jurisdiction') ? 'ac-jurisdiction-error' : undefined
            }
          >
            {SUPPORTED_JURISDICTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FormFieldError id="ac-jurisdiction-error" message={fieldErrors.errorFor('jurisdiction')} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleReview}
          className="flex-1 bg-aegis-dark hover:bg-slate-800 text-white py-2 rounded font-medium transition"
        >
          Review request
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded font-medium transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}