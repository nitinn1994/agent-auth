import { useCallback, useLayoutEffect, useReducer, useRef } from 'react'
import { useAgentAuthService } from '../../services'
import {
  ServiceError,
  type AgentAuthorisation,
  type AuthStep,
  type OtpChallenge,
  type ServiceErrorCode,
  type WalletLimits,
} from '../../types/auth'

export type PendingAction = 'sendOtp' | 'resendOtp' | 'verifyOtp' | 'loadLimits' | 'authorise'

export interface FlowError {
  code: ServiceErrorCode
  message: string
  /** Which action produced the error, so each step only shows its own errors. */
  source: PendingAction
}

export interface FlowState {
  step: AuthStep
  mobile: string
  challenge: OtpChallenge | null
  sessionToken: string | null
  limits: WalletLimits | null
  authorisation: AgentAuthorisation | null
  pending: PendingAction | null
  error: FlowError | null
  /** Incremented whenever the OTP boxes should be cleared (wrong code, new code). */
  otpResetCount: number
}

type Action =
  | { type: 'start'; action: PendingAction }
  | { type: 'fail'; error: FlowError; clearOtp?: boolean }
  | { type: 'otpSent'; mobile: string; challenge: OtpChallenge }
  | { type: 'verified'; sessionToken: string }
  | { type: 'notMember' }
  | { type: 'limitsLoaded'; limits: WalletLimits }
  | { type: 'authorised'; authorisation: AgentAuthorisation }
  | { type: 'sessionExpired'; message: string }
  | { type: 'changeNumber' }
  | { type: 'restart' }
  | { type: 'dismissError' }

export const initialFlowState: FlowState = {
  step: 'mobile',
  mobile: '',
  challenge: null,
  sessionToken: null,
  limits: null,
  authorisation: null,
  pending: null,
  error: null,
  otpResetCount: 0,
}

export function flowReducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case 'start':
      return { ...state, pending: action.action, error: null }
    case 'fail':
      return {
        ...state,
        pending: null,
        error: action.error,
        otpResetCount: action.clearOtp ? state.otpResetCount + 1 : state.otpResetCount,
      }
    case 'otpSent':
      return {
        ...state,
        step: 'otp',
        mobile: action.mobile,
        challenge: action.challenge,
        pending: null,
        error: null,
        otpResetCount: state.otpResetCount + 1,
      }
    case 'verified':
      return { ...state, step: 'limits', sessionToken: action.sessionToken, challenge: null, pending: null }
    case 'notMember':
      return { ...state, step: 'not-member', challenge: null, pending: null }
    case 'limitsLoaded':
      return { ...state, limits: action.limits, pending: null }
    case 'authorised':
      return { ...state, step: 'success', authorisation: action.authorisation, sessionToken: null, pending: null }
    case 'sessionExpired':
      return {
        ...initialFlowState,
        mobile: state.mobile,
        error: { code: 'SESSION_EXPIRED', message: action.message, source: 'sendOtp' },
      }
    case 'changeNumber':
      return { ...state, step: 'mobile', challenge: null, error: null, pending: null }
    case 'restart':
      return { ...initialFlowState }
    case 'dismissError':
      return { ...state, error: null }
  }
}

function toFlowError(err: unknown, source: PendingAction): FlowError {
  if (err instanceof ServiceError) return { code: err.code, message: err.message, source }
  return { code: 'UNKNOWN', message: 'Something went wrong. Please try again.', source }
}

/** Orchestrates the authorisation flow. All service calls go through `AgentAuthService`. */
export function useAuthorisationFlow(agentId: string) {
  const service = useAgentAuthService()
  const [state, dispatch] = useReducer(flowReducer, initialFlowState)
  // Mirror of state for async callbacks, so they never act on a stale closure.
  const stateRef = useRef(state)
  useLayoutEffect(() => {
    stateRef.current = state
  })
  const inFlight = useRef(false)

  const run = useCallback(
    async (action: PendingAction, task: () => Promise<void>, onError?: (e: FlowError) => boolean | void) => {
      if (inFlight.current) return // guard against double submits
      inFlight.current = true
      dispatch({ type: 'start', action })
      try {
        await task()
      } catch (err) {
        const error = toFlowError(err, action)
        if (error.code === 'SESSION_EXPIRED') {
          dispatch({ type: 'sessionExpired', message: error.message })
          return
        }
        const clearOtp = onError?.(error) === true
        dispatch({ type: 'fail', error, clearOtp })
      } finally {
        inFlight.current = false
      }
    },
    [],
  )

  const loadLimits = useCallback(
    (sessionToken: string) =>
      run('loadLimits', async () => {
        const limits = await service.getWalletLimits(sessionToken)
        dispatch({ type: 'limitsLoaded', limits })
      }),
    [run, service],
  )

  const sendOtp = useCallback(
    (mobile: string) =>
      run('sendOtp', async () => {
        const result = await service.sendOtp(mobile)
        if (result.kind === 'not-member') dispatch({ type: 'notMember' })
        else dispatch({ type: 'otpSent', mobile, challenge: result.challenge })
      }),
    [run, service],
  )

  const resendOtp = useCallback(() => {
    const { challenge, mobile } = stateRef.current
    return run('resendOtp', async () => {
      // An expired/unknown challenge can't be resent; fall back to a fresh send.
      const freshSend = async () => {
        const result = await service.sendOtp(mobile)
        if (result.kind === 'not-member') throw new ServiceError('UNKNOWN', 'This number is no longer registered.')
        return result.challenge
      }
      const next = challenge
        ? await service.resendOtp(challenge.challengeId).catch((err: unknown) => {
            if (err instanceof ServiceError && err.code === 'OTP_EXPIRED') return freshSend()
            throw err
          })
        : await freshSend()
      dispatch({ type: 'otpSent', mobile, challenge: next })
    })
  }, [run, service])

  const verifyOtp = useCallback(
    async (otp: string) => {
      const { challenge } = stateRef.current
      if (!challenge) return
      let token: string | null = null
      await run(
        'verifyOtp',
        async () => {
          const result = await service.verifyOtp(challenge.challengeId, otp)
          token = result.sessionToken
          dispatch({ type: 'verified', sessionToken: result.sessionToken })
        },
        () => true,
      )
      if (token) await loadLimits(token)
    },
    [loadLimits, run, service],
  )

  const retryLoadLimits = useCallback(() => {
    const { sessionToken } = stateRef.current
    if (sessionToken) return loadLimits(sessionToken)
  }, [loadLimits])

  const authorise = useCallback(
    (perTransactionLimit: number, expiresOn: string) => {
      const { sessionToken } = stateRef.current
      if (!sessionToken) return
      return run('authorise', async () => {
        const authorisation = await service.authoriseAgent({
          sessionToken,
          agentId,
          perTransactionLimit,
          expiresOn,
          consentAccepted: true,
        })
        dispatch({ type: 'authorised', authorisation })
      })
    },
    [agentId, run, service],
  )

  const changeNumber = useCallback(() => dispatch({ type: 'changeNumber' }), [])
  const restart = useCallback(() => dispatch({ type: 'restart' }), [])
  const dismissError = useCallback(() => dispatch({ type: 'dismissError' }), [])

  return {
    state,
    sendOtp,
    resendOtp,
    verifyOtp,
    retryLoadLimits,
    authorise,
    changeNumber,
    restart,
    dismissError,
  }
}
