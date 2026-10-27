import type { AuthorisationRequest } from '../types/auth'

const DEFAULT_AGENT = { agentId: 'claude', agentName: 'Claude' }

function safeRedirect(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Reads `?agent_id=&agent_name=&redirect_uri=` from the URL. The real parameter names will
 * depend on how the MCP authorisation request is delivered; adjust here only.
 */
export function readAuthorisationRequest(search: string): AuthorisationRequest {
  const params = new URLSearchParams(search)
  const agentName = params.get('agent_name')?.trim().slice(0, 40)
  return {
    agentId: params.get('agent_id')?.trim() || DEFAULT_AGENT.agentId,
    agentName: agentName || DEFAULT_AGENT.agentName,
    redirectUri: safeRedirect(params.get('redirect_uri')),
  }
}
