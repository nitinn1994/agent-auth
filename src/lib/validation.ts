import { addDays, parseIsoDate, toIsoDate } from './dates'

/** Strips non-digits and a leading +91/0 so pasted numbers like "+91 98765-43210" work. */
export function normaliseMobile(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 10)
}

export function validateMobile(mobile: string): string | null {
  if (mobile.length === 0) return 'Enter your mobile number'
  if (mobile.length !== 10) return 'Mobile number must be 10 digits'
  if (!/^[6-9]/.test(mobile)) return 'Enter a valid Indian mobile number'
  return null
}

export function validateOtp(otp: string, length: number): string | null {
  if (!new RegExp(`^\\d{${length}}$`).test(otp)) return `Enter the ${length}-digit code`
  return null
}

export function validatePerTransaction(value: string, max: number): string | null {
  if (value.trim() === '') return 'Enter a per-transaction limit'
  const amount = Number(value)
  if (!Number.isInteger(amount)) return 'Use whole rupees only'
  if (amount < 1) return 'Limit must be at least ₹1'
  if (amount > max) return `Limit can't exceed ₹${max.toLocaleString('en-IN')} for this wallet`
  return null
}

export function expiryBounds(maxExpiryDays: number, today = new Date()) {
  return { min: toIsoDate(addDays(today, 1)), max: toIsoDate(addDays(today, maxExpiryDays)) }
}

export function validateExpiry(value: string, maxExpiryDays: number, today = new Date()): string | null {
  if (!value) return 'Choose when access expires'
  if (!parseIsoDate(value)) return 'Enter a valid date'
  const { min, max } = expiryBounds(maxExpiryDays, today)
  if (value < min) return 'Expiry must be after today'
  if (value > max) return `Access can last at most ${maxExpiryDays} days`
  return null
}
