import type { AgentAuthService } from './agentAuthService'
import { createMockAgentAuthService } from './mockAgentAuthService'

export type { AgentAuthService } from './agentAuthService'
export { AgentAuthServiceContext, useAgentAuthService } from './AgentAuthServiceContext'

/**
 * Single switch-point for the backing implementation. When the MCP API specs are available,
 * add e.g. `createMcpAgentAuthService()` and select it here (or via an env variable).
 */
export function createAgentAuthService(): AgentAuthService {
  return createMockAgentAuthService()
}
