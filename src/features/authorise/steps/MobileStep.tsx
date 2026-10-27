import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { FieldError, FieldLabel } from '../../../components/ui/FieldLabel'
import { normaliseMobile, validateMobile } from '../../../lib/validation'

interface MobileStepProps {
  initialMobile: string
  loading: boolean
  error: string | null
  onSubmit: (mobile: string) => void
}

export function MobileStep({ initialMobile, loading, error, onSubmit }: MobileStepProps) {
  const [mobile, setMobile] = useState(initialMobile)
  const [touched, setTouched] = useState(false)
  const validationError = validateMobile(mobile)
  const showValidation = touched && mobile.length > 0 && validationError

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!validationError) onSubmit(mobile)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <p className="text-sm text-navy-900/80">Verify your mobile number to link your prepaid balance.</p>

      <div>
        <FieldLabel htmlFor="mobile">Mobile number</FieldLabel>
        <div className="flex gap-2">
          <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-md border border-line text-sm text-navy-900">
            +91
          </span>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={mobile}
            disabled={loading}
            onChange={(e) => setMobile(normaliseMobile(e.target.value))}
            onBlur={() => setTouched(true)}
            aria-invalid={showValidation ? true : undefined}
            aria-describedby={showValidation ? 'mobile-error' : undefined}
            className="h-11 w-full min-w-0 rounded-md border border-line px-3 text-sm tracking-wide text-navy-900 outline-none placeholder:text-muted/60 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15 aria-invalid:border-red-400 disabled:bg-gray-50"
          />
        </div>
        <FieldError id="mobile-error">{showValidation}</FieldError>
      </div>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" disabled={!!validationError} loading={loading} loadingText="Sending OTP…">
        Send OTP
      </Button>
    </form>
  )
}
