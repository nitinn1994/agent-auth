import { useEffect, useState } from 'react'

/**
 * Counts down from `seconds` to 0, once per second. Changing `resetKey` restarts the timer,
 * which is how a fresh OTP challenge restarts the resend countdown.
 */
export function useCountdown(seconds: number, resetKey: unknown): number {
  const [state, setState] = useState({ key: resetKey, remaining: seconds })

  // Restart synchronously during render when the key changes (avoids a flash of the old value).
  let remaining = state.remaining
  if (state.key !== resetKey) {
    remaining = seconds
    setState({ key: resetKey, remaining: seconds })
  }

  useEffect(() => {
    if (remaining <= 0) return
    const id = setTimeout(() => setState((s) => ({ ...s, remaining: s.remaining - 1 })), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  return remaining
}
