import { describe, expect, it } from 'vitest'
import { normaliseMobile, validateExpiry, validateMobile, validatePerTransaction } from './validation'

describe('normaliseMobile', () => {
  it.each([
    ['+91 98765-43210', '9876543210'],
    ['09876543210', '9876543210'],
    ['98765 43210 99', '9876543210'],
    ['abc', ''],
  ])('%s -> %s', (input, expected) => expect(normaliseMobile(input)).toBe(expected))
})

describe('validateMobile', () => {
  it('accepts valid Indian mobiles', () => expect(validateMobile('9876543210')).toBeNull())
  it('rejects short numbers', () => expect(validateMobile('98765')).toMatch(/10 digits/))
  it('rejects numbers not starting 6-9', () => expect(validateMobile('1234567890')).toMatch(/valid/))
})

describe('validatePerTransaction', () => {
  it('accepts within cap', () => expect(validatePerTransaction('4000', 10000)).toBeNull())
  it('rejects above cap', () => expect(validatePerTransaction('10001', 10000)).toMatch(/exceed/))
  it('rejects decimals and zero', () => {
    expect(validatePerTransaction('10.5', 10000)).toMatch(/whole/)
    expect(validatePerTransaction('0', 10000)).toMatch(/at least/)
  })
})

describe('validateExpiry', () => {
  const today = new Date(2026, 9, 27)
  it('accepts a date inside the window', () => expect(validateExpiry('2026-11-09', 90, today)).toBeNull())
  it('rejects today', () => expect(validateExpiry('2026-10-27', 90, today)).toMatch(/after today/))
  it('rejects beyond the window', () => expect(validateExpiry('2027-02-01', 90, today)).toMatch(/90 days/))
  it('rejects impossible dates', () => expect(validateExpiry('2026-02-31', 90, today)).toMatch(/valid/))
})
