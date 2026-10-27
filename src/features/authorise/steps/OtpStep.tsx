import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { FieldLabel } from '../../../components/ui/FieldLabel'
import { OtpInput } from '../../../components/ui/OtpInput'
import { useCountdown } from '../../../hooks/useCountdown'
import { formatCountdown } from '../../../lib/format'
import type { OtpChallenge } from '../../../types/auth'

interface OtpStepProps {
  challenge: OtpChallenge
  verifying: boolean
  resending: boolean
  error: string | null
  /** Changes whenever the entered code should be cleared. */
  resetKey: number
  onVerify: (otp: string) => void
  onResend: () => void
  onChangeNumber: () => void
}

export function OtpStep({
  challenge,
  verifying,
  resending,
  error,
  resetKey,
  onVerify,
  onResend,
  onChangeNumber,
}: OtpStepProps) {
  const [otp, setOtp] = useState({ key: resetKey, value: '' })
  if (otp.key !== resetKey) setOtp({ key: resetKey, value: '' })
  const code = otp.key === resetKey ? otp.value : ''

  const secondsLeft = useCountdown(challenge.resendAfterSec, challenge.challengeId)
  const complete = code.length === challenge.otpLength
  const busy = verifying || resending

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (complete && !busy) onVerify(code)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-navy-900/80">
        Enter the {challenge.otpLength}-digit code sent to{' '}
        <span className="font-medium whitespace-nowrap text-navy-900">{challenge.maskedMobile}</span>{' '}
        <button
          type="button"
          onClick={onChangeNumber}
          disabled={busy}
          className="text-xs font-semibold text-link hover:underline disabled:text-muted"
        >
          Change
        </button>
      </p>

      <div>
        <FieldLabel id="otp-label">One time password</FieldLabel>
        <OtpInput
          value={code}
          onChange={(value) => setOtp({ key: resetKey, value })}
          length={challenge.otpLength}
          disabled={busy}
          invalid={!!error}
          autoFocus
          labelledBy="otp-label"
          describedBy={error ? 'otp-error' : undefined}
        />
        <div className="mt-2.5 flex items-center justify-between">
          {/* Only the "can resend" state is announced; a per-second countdown would be noisy. */}
          <span className="text-xs text-muted tabular-nums">
            {secondsLeft > 0 ? (
              <span aria-hidden="true">Resend in {formatCountdown(secondsLeft)}</span>
            ) : null}
            <span aria-live="polite" className={secondsLeft > 0 ? 'sr-only' : undefined}>
              {secondsLeft > 0 ? '' : "Didn't get the code?"}
            </span>
          </span>
          <Button variant="link" onClick={onResend} disabled={secondsLeft > 0 || busy} loading={resending}>
            Resend OTP
          </Button>
        </div>
      </div>

      {error && (
        <div id="otp-error">
          <Alert>{error}</Alert>
        </div>
      )}

      <Button type="submit" disabled={!complete || resending} loading={verifying} loadingText="Verifying…">
        Verify &amp; continue
      </Button>
    </form>
  )
}
