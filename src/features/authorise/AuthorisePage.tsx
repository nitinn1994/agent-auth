import { AuthCard } from '../../components/AuthCard'
import { Stepper } from '../../components/ui/Stepper'
import type { AuthorisationRequest, AuthStep } from '../../types/auth'
import { LimitsStep } from './steps/LimitsStep'
import { MobileStep } from './steps/MobileStep'
import { NotMemberScreen } from './steps/NotMemberScreen'
import { OtpStep } from './steps/OtpStep'
import { SuccessStep } from './steps/SuccessStep'
import { useAuthorisationFlow, type PendingAction } from './useAuthorisationFlow'

const STEPS = ['Verify', 'Limits', 'Redirect'] as const

const STEP_INDEX: Record<Exclude<AuthStep, 'not-member'>, number> = {
  mobile: 0,
  otp: 0,
  limits: 1,
  success: STEPS.length,
}

interface AuthorisePageProps {
  request: AuthorisationRequest
  onRedirect: (url: string) => void
}

export function AuthorisePage({ request, onRedirect }: AuthorisePageProps) {
  const flow = useAuthorisationFlow(request.agentId)
  const { state } = flow
  const errorFrom = (...sources: PendingAction[]) =>
    state.error && sources.includes(state.error.source) ? state.error.message : null

  if (state.step === 'not-member') {
    return (
      <AuthCard eyebrow="Pine Labs Prepaid · Get started" title="Complete your Sign-up">
        <NotMemberScreen onBackToLogin={flow.restart} />
      </AuthCard>
    )
  }

  return (
    <AuthCard
      eyebrow="Pine Labs Prepaid · Secure authorisation"
      title="Authorise an Agent"
      progress={<Stepper steps={STEPS} current={STEP_INDEX[state.step]} />}
    >
      {state.step === 'mobile' && (
        <MobileStep
          initialMobile={state.mobile}
          loading={state.pending === 'sendOtp'}
          error={errorFrom('sendOtp')}
          onSubmit={flow.sendOtp}
        />
      )}
      {state.step === 'otp' && state.challenge && (
        <OtpStep
          challenge={state.challenge}
          verifying={state.pending === 'verifyOtp'}
          resending={state.pending === 'resendOtp'}
          error={errorFrom('verifyOtp', 'resendOtp')}
          resetKey={state.otpResetCount}
          onVerify={flow.verifyOtp}
          onResend={flow.resendOtp}
          onChangeNumber={flow.changeNumber}
        />
      )}
      {state.step === 'limits' && (
        <LimitsStep
          limits={state.limits}
          loadingLimits={state.pending === 'loadLimits'}
          submitting={state.pending === 'authorise'}
          loadError={errorFrom('loadLimits')}
          submitError={errorFrom('authorise')}
          onRetryLoad={flow.retryLoadLimits}
          onSubmit={flow.authorise}
        />
      )}
      {state.step === 'success' && state.authorisation && (
        <SuccessStep
          agentName={request.agentName}
          authorisation={state.authorisation}
          redirectUri={request.redirectUri}
          onRedirect={onRedirect}
        />
      )}
    </AuthCard>
  )
}
