import { useEffect } from 'react'
import { ShieldCheckIcon } from '../../../components/icons'
import { useCountdown } from '../../../hooks/useCountdown'
import type { AgentAuthorisation } from '../../../types/auth'

const REDIRECT_DELAY_SEC = 4

interface SuccessStepProps {
  agentName: string
  authorisation: AgentAuthorisation
  redirectUri: string | null
  onRedirect: (url: string) => void
}

export function SuccessStep({ agentName, authorisation, redirectUri, onRedirect }: SuccessStepProps) {
  const secondsLeft = useCountdown(REDIRECT_DELAY_SEC, authorisation.authorisationId)

  useEffect(() => {
    if (redirectUri && secondsLeft === 0) onRedirect(redirectUri)
  }, [onRedirect, redirectUri, secondsLeft])

  return (
    <div className="flex flex-col items-center py-2 text-center" role="status">
      <span className="flex size-12 items-center justify-center rounded-full bg-[#e8eef8] text-navy-700">
        <ShieldCheckIcon className="size-6" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-navy-900">{agentName} is authorised</h2>
      <p className="mt-1.5 max-w-64 text-xs leading-relaxed text-muted">
        You can modify the values and access using your Pine Labs app.
      </p>

      <p className="mt-5 flex items-center gap-2 text-xs text-navy-900/80">
        Taking you back to {agentName}…
        {redirectUri && (
          <button type="button" onClick={() => onRedirect(redirectUri)} className="font-semibold text-link hover:underline">
            Go now
          </button>
        )}
      </p>
    </div>
  )
}
