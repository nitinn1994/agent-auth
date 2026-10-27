import { formatIndianMobile } from '../lib/format'
import { validateExpiry, validateMobile, validatePerTransaction } from '../lib/validation'
import {
  ServiceError,
  type AgentAuthorisation,
  type AuthoriseAgentInput,
  type OtpChallenge,
  type OtpVerification,
  type SendOtpResult,
  type WalletLimits,
} from '../types/auth'
import type { AgentAuthService } from './agentAuthService'
import {
  MOCK_MAX_OTP_ATTEMPTS,
  MOCK_NETWORK_FAILURE_MOBILE,
  MOCK_OTP,
  MOCK_RESEND_AFTER_SEC,
  MOCK_WALLET_HOLDERS,
} from './mockData'

interface ChallengeRecord {
  mobile: string
  attempts: number
  issuedAt: number
  consumed: boolean
}

interface MockOptions {
  /** Simulated network latency in ms. */
  latencyMs?: number
  /** OTP validity window in ms. */
  otpTtlMs?: number
  now?: () => number
}

const OTP_LENGTH = 6

/** In-memory stand-in for the MCP service. Behaviour is documented in `mockData.ts`. */
export function createMockAgentAuthService(options: MockOptions = {}): AgentAuthService {
  const { latencyMs = 700, otpTtlMs = 5 * 60_000, now = Date.now } = options
  const challenges = new Map<string, ChallengeRecord>()
  const sessions = new Map<string, string>() // token -> mobile
  let seq = 0

  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, latencyMs))
  const nextId = (prefix: string) => `${prefix}_${now().toString(36)}_${(++seq).toString(36)}`

  function issueChallenge(mobile: string): OtpChallenge {
    const challengeId = nextId('otp')
    challenges.set(challengeId, { mobile, attempts: 0, issuedAt: now(), consumed: false })
    return {
      challengeId,
      maskedMobile: formatIndianMobile(mobile),
      resendAfterSec: MOCK_RESEND_AFTER_SEC,
      otpLength: OTP_LENGTH,
    }
  }

  function requireSession(token: string): string {
    const mobile = sessions.get(token)
    if (!mobile) throw new ServiceError('SESSION_EXPIRED', 'Your session has expired. Please verify again.')
    return mobile
  }

  return {
    async sendOtp(mobile): Promise<SendOtpResult> {
      await delay()
      if (mobile === MOCK_NETWORK_FAILURE_MOBILE) {
        throw new ServiceError('NETWORK', "We couldn't reach Pine Labs. Check your connection and try again.")
      }
      const invalid = validateMobile(mobile)
      if (invalid) throw new ServiceError('INVALID_MOBILE', invalid)
      if (!MOCK_WALLET_HOLDERS[mobile]) return { kind: 'not-member' }
      return { kind: 'otp-sent', challenge: issueChallenge(mobile) }
    },

    async resendOtp(challengeId) {
      await delay()
      const record = challenges.get(challengeId)
      if (!record) throw new ServiceError('OTP_EXPIRED', 'This code request has expired. Start again.')
      if (now() - record.issuedAt < MOCK_RESEND_AFTER_SEC * 1000) {
        throw new ServiceError('RESEND_TOO_SOON', 'Please wait before requesting another code.')
      }
      challenges.delete(challengeId)
      return issueChallenge(record.mobile)
    },

    async verifyOtp(challengeId, otp): Promise<OtpVerification> {
      await delay()
      const record = challenges.get(challengeId)
      if (!record || record.consumed || now() - record.issuedAt > otpTtlMs) {
        throw new ServiceError('OTP_EXPIRED', 'This code has expired. Request a new one.')
      }
      if (record.attempts >= MOCK_MAX_OTP_ATTEMPTS) {
        throw new ServiceError('TOO_MANY_ATTEMPTS', 'Too many incorrect attempts. Request a new code.')
      }
      if (otp !== MOCK_OTP) {
        record.attempts += 1
        const left = MOCK_MAX_OTP_ATTEMPTS - record.attempts
        if (left === 0) {
          throw new ServiceError('TOO_MANY_ATTEMPTS', 'Too many incorrect attempts. Request a new code.')
        }
        throw new ServiceError('INVALID_OTP', `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`)
      }
      record.consumed = true
      const sessionToken = nextId('sess')
      sessions.set(sessionToken, record.mobile)
      return { sessionToken }
    },

    async getWalletLimits(sessionToken): Promise<WalletLimits> {
      await delay()
      const mobile = requireSession(sessionToken)
      return { ...MOCK_WALLET_HOLDERS[mobile].limits }
    },

    async authoriseAgent(input: AuthoriseAgentInput): Promise<AgentAuthorisation> {
      await delay()
      const mobile = requireSession(input.sessionToken)
      const { limits } = MOCK_WALLET_HOLDERS[mobile]
      const limitError = validatePerTransaction(String(input.perTransactionLimit), limits.maxPerTransaction)
      if (limitError) throw new ServiceError('LIMIT_EXCEEDED', limitError)
      const expiryError = validateExpiry(input.expiresOn, limits.maxExpiryDays, new Date(now()))
      if (expiryError) throw new ServiceError('INVALID_EXPIRY', expiryError)
      sessions.delete(input.sessionToken)
      return {
        authorisationId: nextId('auth'),
        agentId: input.agentId,
        perTransactionLimit: input.perTransactionLimit,
        expiresOn: input.expiresOn,
      }
    },
  }
}

