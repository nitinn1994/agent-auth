import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { FieldError, FieldLabel } from '../../../components/ui/FieldLabel'
import { Spinner } from '../../../components/ui/Spinner'
import { isoDateInDays } from '../../../lib/dates'
import { expiryBounds, validateExpiry, validatePerTransaction } from '../../../lib/validation'
import type { WalletLimits } from '../../../types/auth'

interface LimitsStepProps {
  limits: WalletLimits | null
  loadingLimits: boolean
  submitting: boolean
  /** Error from loading limits; shown with a retry button instead of the form. */
  loadError: string | null
  submitError: string | null
  onRetryLoad: () => void
  onSubmit: (perTransactionLimit: number, expiresOn: string) => void
}

const TERMS_URL = 'https://www.pinelabs.com/terms-and-conditions'
const PRIVACY_URL = 'https://www.pinelabs.com/privacy-policy'

export function LimitsStep({ limits, loadingLimits, submitting, loadError, submitError, onRetryLoad, onSubmit }: LimitsStepProps) {
  if (!limits) {
    return (
      <div className="space-y-4 py-4">
        {loadError ? (
          <Alert
            action={
              <button type="button" onClick={onRetryLoad} className="shrink-0 font-semibold underline">
                Retry
              </button>
            }
          >
            {loadError}
          </Alert>
        ) : (
          <p className="flex items-center justify-center gap-2 text-sm text-muted" role="status">
            <Spinner /> {loadingLimits ? 'Loading your wallet…' : 'Preparing…'}
          </p>
        )}
      </div>
    )
  }
  return <LimitsForm limits={limits} submitting={submitting} error={submitError} onSubmit={onSubmit} />
}

function LimitsForm({
  limits,
  submitting,
  error,
  onSubmit,
}: {
  limits: WalletLimits
  submitting: boolean
  error: string | null
  onSubmit: (perTransactionLimit: number, expiresOn: string) => void
}) {
  const [amount, setAmount] = useState(String(limits.defaultPerTransaction))
  const [expiry, setExpiry] = useState(() => isoDateInDays(limits.defaultExpiryDays))
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const amountError = validatePerTransaction(amount, limits.maxPerTransaction)
  const expiryError = validateExpiry(expiry, limits.maxExpiryDays)
  const bounds = expiryBounds(limits.maxExpiryDays)
  const canSubmit = !amountError && !expiryError && consent

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (canSubmit) onSubmit(Number(amount), expiry)
  }

  const showAmountError = (submitted || amount !== String(limits.defaultPerTransaction)) && amountError
  const showExpiryError = (submitted || expiry !== '') && expiryError

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-navy-900/80">Set what the agent may spend from your AgentWallet.</p>

      <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 min-[360px]:gap-3">
        <div className="min-w-0">
          <FieldLabel htmlFor="per-txn">Per transaction (₹)</FieldLabel>
          <input
            id="per-txn"
            type="number"
            inputMode="numeric"
            min={1}
            max={limits.maxPerTransaction}
            step={1}
            value={amount}
            disabled={submitting}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={showAmountError ? true : undefined}
            aria-describedby={showAmountError ? 'per-txn-error' : undefined}
            className="h-11 w-full rounded-md border border-line px-3 text-sm text-navy-900 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15 aria-invalid:border-red-400 disabled:bg-gray-50"
          />
          <FieldError id="per-txn-error">{showAmountError}</FieldError>
        </div>
        <div className="min-w-0">
          <FieldLabel htmlFor="expiry">Access expires after</FieldLabel>
          <input
            id="expiry"
            type="date"
            min={bounds.min}
            max={bounds.max}
            value={expiry}
            disabled={submitting}
            onChange={(e) => setExpiry(e.target.value)}
            aria-invalid={showExpiryError ? true : undefined}
            aria-describedby={showExpiryError ? 'expiry-error' : undefined}
            className="h-11 w-full rounded-md border border-line px-3 text-sm text-navy-900 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15 aria-invalid:border-red-400 disabled:bg-gray-50"
          />
          <FieldError id="expiry-error">{showExpiryError}</FieldError>
        </div>
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-navy-900/80">
          <input
            type="checkbox"
            checked={consent}
            disabled={submitting}
            onChange={(e) => setConsent(e.target.checked)}
            aria-describedby={submitted && !consent ? 'consent-error' : undefined}
            className="mt-0.5 size-4 shrink-0 accent-navy-900"
          />
          <span>
            I agree to the{' '}
            <a href={TERMS_URL} target="_blank" rel="noreferrer" className="font-medium text-link underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="font-medium text-link underline">
              Privacy Policy
            </a>{' '}
            for my Pine Labs AgentWallet.
          </span>
        </label>
        <FieldError id="consent-error">{submitted && !consent ? 'Please accept the terms to continue' : null}</FieldError>
      </div>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={!canSubmit} loading={submitting} loadingText="Authorising…">
        Verify &amp; confirm
      </Button>
    </form>
  )
}
