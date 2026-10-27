import { describe, expect, it } from 'vitest'
import { isoDateInDays } from '../lib/dates'
import { ServiceError } from '../types/auth'
import type { AgentAuthService } from './agentAuthService'
import { createMockAgentAuthService } from './mockAgentAuthService'
import { MOCK_NETWORK_FAILURE_MOBILE, MOCK_OTP } from './mockData'

const MEMBER = '9876543210'

function setup() {
  let clock = Date.now()
  const service = createMockAgentAuthService({ latencyMs: 0, now: () => clock })
  return { service, advance: (ms: number) => (clock += ms) }
}

async function sendMemberOtp(service: AgentAuthService) {
  const result = await service.sendOtp(MEMBER)
  if (result.kind !== 'otp-sent') throw new Error('expected an OTP for a member')
  return result.challenge
}

const codeOf = (p: Promise<unknown>) => p.then(() => 'OK', (e: ServiceError) => e.code)

describe('mock agent auth service', () => {
  it('runs the happy path for a member', async () => {
    const { service } = setup()
    const challenge = await sendMemberOtp(service)
    expect(challenge.maskedMobile).toBe('+91 98765 43210')
    const result = await service.verifyOtp(challenge.challengeId, MOCK_OTP)
    const limits = await service.getWalletLimits(result.sessionToken)
    const auth = await service.authoriseAgent({
      sessionToken: result.sessionToken,
      agentId: 'claude',
      perTransactionLimit: 4000,
      expiresOn: isoDateInDays(14),
      consentAccepted: true,
    })
    expect(limits.maxPerTransaction).toBe(10000)
    expect(auth.perTransactionLimit).toBe(4000)
    // Session is single use.
    expect(await codeOf(service.getWalletLimits(result.sessionToken))).toBe('SESSION_EXPIRED')
  })

  it('reports non-members without sending an OTP', async () => {
    const { service } = setup()
    expect(await service.sendOtp('9555555555')).toEqual({ kind: 'not-member' })
  })

  it('locks the challenge after three wrong codes', async () => {
    const { service } = setup()
    const { challengeId } = await sendMemberOtp(service)
    expect(await codeOf(service.verifyOtp(challengeId, '000000'))).toBe('INVALID_OTP')
    expect(await codeOf(service.verifyOtp(challengeId, '000000'))).toBe('INVALID_OTP')
    expect(await codeOf(service.verifyOtp(challengeId, '000000'))).toBe('TOO_MANY_ATTEMPTS')
    expect(await codeOf(service.verifyOtp(challengeId, MOCK_OTP))).toBe('TOO_MANY_ATTEMPTS')
  })

  it('enforces resend cool-down and OTP expiry', async () => {
    const { service, advance } = setup()
    const first = await sendMemberOtp(service)
    expect(await codeOf(service.resendOtp(first.challengeId))).toBe('RESEND_TOO_SOON')
    advance(31_000)
    const second = await service.resendOtp(first.challengeId)
    expect(await codeOf(service.verifyOtp(first.challengeId, MOCK_OTP))).toBe('OTP_EXPIRED')
    advance(6 * 60_000)
    expect(await codeOf(service.verifyOtp(second.challengeId, MOCK_OTP))).toBe('OTP_EXPIRED')
  })

  it('rejects limits above the wallet cap and simulates network failure', async () => {
    const { service } = setup()
    expect(await codeOf(service.sendOtp(MOCK_NETWORK_FAILURE_MOBILE))).toBe('NETWORK')
    const { challengeId } = await sendMemberOtp(service)
    const result = await service.verifyOtp(challengeId, MOCK_OTP)
    const attempt = service.authoriseAgent({
      sessionToken: result.sessionToken,
      agentId: 'claude',
      perTransactionLimit: 50_000,
      expiresOn: isoDateInDays(14),
      consentAccepted: true,
    })
    expect(await codeOf(attempt)).toBe('LIMIT_EXCEEDED')
  })
})
