import { createContext, useContext } from 'react'
import type { AgentAuthService } from './agentAuthService'

export const AgentAuthServiceContext = createContext<AgentAuthService | null>(null)

export function useAgentAuthService(): AgentAuthService {
  const service = useContext(AgentAuthServiceContext)
  if (!service) throw new Error('useAgentAuthService must be used inside <AgentAuthServiceContext>')
  return service
}
