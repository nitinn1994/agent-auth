/** "9876543210" -> "+91 98765 43210" */
export function formatIndianMobile(mobile: string): string {
  return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`.trim()
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
