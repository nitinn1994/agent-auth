import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AgentAuthServiceContext } from '../../services'
import { createMockAgentAuthService } from '../../services/mockAgentAuthService'
import { MOCK_NETWORK_FAILURE_MOBILE, MOCK_OTP } from '../../services/mockData'
import { AuthorisePage } from './AuthorisePage'

function renderPage() {
  const user = userEvent.setup()
  render(
    <AgentAuthServiceContext value={createMockAgentAuthService({ latencyMs: 0 })}>
      <AuthorisePage request={{ agentId: 'claude', agentName: 'Claude', redirectUri: null }} onRedirect={vi.fn()} />
    </AgentAuthServiceContext>,
  )
  return user
}

async function submitMobile(user: ReturnType<typeof userEvent.setup>, mobile: string) {
  const sendButton = screen.getByRole('button', { name: 'Send OTP' })
  expect(sendButton).toBeDisabled()
  await user.type(screen.getByLabelText(/mobile number/i), mobile)
  await user.click(sendButton)
}

async function enterOtp(user: ReturnType<typeof userEvent.setup>, otp: string) {
  await user.click(await screen.findByLabelText('Digit 1 of 6'))
  await user.keyboard(otp)
  await user.click(screen.getByRole('button', { name: /verify & continue/i }))
}

describe('AuthorisePage', () => {
  it('authorises the agent end to end', async () => {
    const user = renderPage()
    await submitMobile(user, '9876543210')
    expect(await screen.findByText('+91 98765 43210')).toBeInTheDocument()

    await enterOtp(user, MOCK_OTP)
    const amount = await screen.findByLabelText(/per transaction/i)
    expect(amount).toHaveValue(4000)

    const confirm = screen.getByRole('button', { name: /verify & confirm/i })
    expect(confirm).toBeDisabled()
    await user.click(screen.getByRole('checkbox'))
    await user.clear(amount)
    await user.type(amount, '2500')
    await user.click(confirm)

    expect(await screen.findByRole('heading', { name: 'Claude is authorised' })).toBeInTheDocument()
  })

  it('shows an error and clears the code on a wrong OTP', async () => {
    const user = renderPage()
    await submitMobile(user, '9876543210')
    await enterOtp(user, '111111')
    expect(await screen.findByRole('alert')).toHaveTextContent(/incorrect code/i)
    expect(screen.getByLabelText('Digit 1 of 6')).toHaveValue('')
  })

  it('routes unregistered numbers straight to the sign-up screen and back', async () => {
    const user = renderPage()
    await submitMobile(user, '9555555555')
    expect(await screen.findByRole('heading', { name: /not a member yet/i })).toBeInTheDocument()
    expect(screen.queryByLabelText('Digit 1 of 6')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back to login/i }))
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue('')
  })

  it('surfaces network errors on send', async () => {
    const user = renderPage()
    await submitMobile(user, MOCK_NETWORK_FAILURE_MOBILE)
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't reach/i)
  })

  it('blocks limits above the wallet cap', async () => {
    const user = renderPage()
    await submitMobile(user, '9123456789')
    await enterOtp(user, MOCK_OTP)
    const amount = await screen.findByLabelText(/per transaction/i)
    await user.clear(amount)
    await user.type(amount, '5000')
    await user.click(screen.getByRole('checkbox'))
    expect(screen.getByText(/can't exceed ₹2,000/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verify & confirm/i })).toBeDisabled()
  })

  it('lets the user change the number from the OTP step', async () => {
    const user = renderPage()
    await submitMobile(user, '9876543210')
    await user.click(await screen.findByRole('button', { name: 'Change' }))
    expect(screen.getByLabelText(/mobile number/i)).toHaveValue('9876543210')
  })
})
