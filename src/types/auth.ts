/** Domain types for the agent-authorisation flow. Shapes are provisional until MCP API specs land. */

export type AuthStep = 'mobile' | 'otp' | 'limits' | 'success' | 'not-member'

/** Context about the agent requesting access, normally supplied by the caller (query string). */
export interface AuthorisationRequest {
  agentId: string
  agentName: string
  /** Where to send the user once authorised. Only http(s) URLs are honoured. */
  redirectUri: string | null
}

export interface OtpChallenge {
  challengeId: string
  /** E.164-style display value, e.g. "+91 98765 43210". */
  maskedMobile: string
  /** Seconds the user must wait before requesting a resend. */
  resendAfterSec: number
  otpLength: number
}

/** Membership is checked before an OTP is sent; non-members never receive one. */
export type SendOtpResult = { kind: 'otp-sent'; challenge: OtpChallenge } | { kind: 'not-member' }

export interface OtpVerification {
  sessionToken: string
}

export interface WalletLimits {
  currency: 'INR'
  availableBalance: number
  /** Hard cap the wallet allows per agent transaction. */
  maxPerTransaction: number
  defaultPerTransaction: number
  /** Furthest an authorisation may be set to expire, in days from today. */
  maxExpiryDays: number
  defaultExpiryDays: number
}

export interface AuthoriseAgentInput {
  sessionToken: string
  agentId: string
  perTransactionLimit: number
  /** ISO date (YYYY-MM-DD). */
  expiresOn: string
  consentAccepted: true
}

export interface AgentAuthorisation {
  authorisationId: string
  agentId: string
  perTransactionLimit: number
  expiresOn: string
}

export type ServiceErrorCode =
  | 'INVALID_MOBILE'
  | 'INVALID_OTP'
  | 'OTP_EXPIRED'
  | 'TOO_MANY_ATTEMPTS'
  | 'RESEND_TOO_SOON'
  | 'SESSION_EXPIRED'
  | 'LIMIT_EXCEEDED'
  | 'INVALID_EXPIRY'
  | 'NETWORK'
  | 'UNKNOWN'

export class ServiceError extends Error {
  readonly code: ServiceErrorCode

  constructor(code: ServiceErrorCode, message: string) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
  }
}
