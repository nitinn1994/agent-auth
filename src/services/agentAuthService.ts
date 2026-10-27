import type {
  AgentAuthorisation,
  AuthoriseAgentInput,
  OtpChallenge,
  OtpVerification,
  SendOtpResult,
  WalletLimits,
} from '../types/auth'

/**
 * Contract the UI depends on. The mock implementation lives in `mockAgentAuthService.ts`;
 * a real implementation backed by the MCP service APIs should implement this same interface
 * and throw `ServiceError` with a matching `code` so the UI's error handling keeps working.
 */
export interface AgentAuthService {
  /**
   * Check membership for a 10-digit Indian mobile number (no country code) and, for members only,
   * send an OTP.
   */
  sendOtp(mobile: string): Promise<SendOtpResult>
  resendOtp(challengeId: string): Promise<OtpChallenge>
  verifyOtp(challengeId: string, otp: string): Promise<OtpVerification>
  getWalletLimits(sessionToken: string): Promise<WalletLimits>
  authoriseAgent(input: AuthoriseAgentInput): Promise<AgentAuthorisation>
}
