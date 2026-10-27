import { useMemo } from 'react'
import { MockModeBanner } from './components/MockModeBanner'
import { AuthorisePage } from './features/authorise/AuthorisePage'
import { readAuthorisationRequest } from './lib/authorisationRequest'
import { AgentAuthServiceContext, createAgentAuthService } from './services'

const redirect = (url: string) => window.location.assign(url)

export default function App() {
  const service = useMemo(() => createAgentAuthService(), [])
  const request = useMemo(() => readAuthorisationRequest(window.location.search), [])

  return (
    <AgentAuthServiceContext value={service}>
      <AuthorisePage request={request} onRedirect={redirect} />
      {import.meta.env.DEV && <MockModeBanner />}
    </AgentAuthServiceContext>
  )
}
