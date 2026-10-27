import { MOCK_NETWORK_FAILURE_MOBILE, MOCK_OTP, MOCK_WALLET_HOLDERS } from '../services/mockData'

/** Dev-only cheat sheet for exercising the mock service. Not rendered in production builds. */
export function MockModeBanner() {
  const members = Object.keys(MOCK_WALLET_HOLDERS)
  return (
    <aside className="fixed inset-x-0 bottom-0 z-10 border-t border-amber-300 bg-amber-50/95 px-4 py-2 text-[11px] leading-relaxed text-amber-900 backdrop-blur sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-xs sm:rounded-lg sm:border">
      <strong className="font-semibold">Mock mode.</strong> OTP <code>{MOCK_OTP}</code> · members{' '}
      {members.map((m) => (
        <code key={m} className="mr-1">
          {m}
        </code>
      ))}
      · any other number → sign-up · <code>{MOCK_NETWORK_FAILURE_MOBILE}</code> → network error
    </aside>
  )
}
