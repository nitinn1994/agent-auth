import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length: number
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  /** Called once all digits are filled. */
  onComplete?: (value: string) => void
  labelledBy?: string
  describedBy?: string
}

/** Segmented numeric OTP input with auto-advance, backspace navigation and paste support. */
export function OtpInput({
  value,
  onChange,
  length,
  disabled,
  invalid,
  autoFocus,
  onComplete,
  labelledBy,
  describedBy,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const commit = (next: string, focusIndex: number) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    focus(focusIndex)
    if (clean.length === length) onComplete?.(clean)
  }

  const handleInput = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, '')
    if (!typed) return
    // Overwrite from position i; multi-char input covers SMS autofill landing in one box.
    const start = Math.min(i, value.length)
    const next = (value.slice(0, start) + typed + value.slice(start + typed.length)).slice(0, length)
    commit(next, start + typed.length)
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) commit(value.slice(0, i) + value.slice(i + 1), i)
      else if (i > 0) commit(value.slice(0, i - 1) + value.slice(i), i - 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focus(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focus(i + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) commit(pasted, pasted.length)
  }

  return (
    <div role="group" aria-labelledby={labelledBy} className="flex justify-between gap-1.5 sm:gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="password"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'aspect-square w-full min-w-0 max-w-12 rounded-md border bg-white text-center text-lg font-semibold text-navy-900 outline-none transition-colors',
            'focus:border-navy-900 focus:ring-2 focus:ring-navy-900/15 disabled:bg-gray-50',
            invalid ? 'border-red-400' : digit ? 'border-navy-900' : 'border-line',
          )}
        />
      ))}
    </div>
  )
}
