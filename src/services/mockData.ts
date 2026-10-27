import type { WalletLimits } from '../types/auth'

/** OTP accepted by the mock service for every challenge. */
export const MOCK_OTP = '123456'

/** Mobile number that makes the mock service fail with a network error (for testing error UI). */
export const MOCK_NETWORK_FAILURE_MOBILE = '9000000000'

export const MOCK_MAX_OTP_ATTEMPTS = 3
export const MOCK_RESEND_AFTER_SEC = 30

export interface MockWalletHolder {
  name: string
  limits: WalletLimits
}

/** Registered Pine Labs Prepaid wallet holders. Any other valid number is treated as "not a member". */
export const MOCK_WALLET_HOLDERS: Record<string, MockWalletHolder> = {
  '9876543210': {
    name: 'Ananya Sharma',
    limits: {
      currency: 'INR',
      availableBalance: 25_000,
      maxPerTransaction: 10_000,
      defaultPerTransaction: 4_000,
      maxExpiryDays: 90,
      defaultExpiryDays: 14,
    },
  },
  '9123456789': {
    name: 'Rahul Verma',
    limits: {
      currency: 'INR',
      availableBalance: 3_200,
      maxPerTransaction: 2_000,
      defaultPerTransaction: 1_000,
      maxExpiryDays: 30,
      defaultExpiryDays: 7,
    },
  },
}
