import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = { fill: 'none', 'aria-hidden': true } as const

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" {...base} {...props}>
      <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path
        d="M12 3 5 6v5.5c0 4.2 2.9 8 7 9.5 4.1-1.5 7-5.3 7-9.5V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="m9 12 2.2 2.2L15.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Generic stand-in mark; swap for the official brand asset. */
export function BrandMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M6 18 18 6M18 6h-8.5M18 6v8.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlayStoreIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#34A853" d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.7-.6-1.2V3.5c0-.5.2-1 .6-1.2Z" />
      <path fill="#FBBC04" d="m16.7 8.7 3.6 2c1 .6 1 2 0 2.6l-3.6 2L13.4 12l3.3-3.3Z" />
      <path fill="#4285F4" d="M3.6 2.3c.4-.3 1-.3 1.6 0l11.5 6.4-3.3 3.3-9.8-9.7Z" />
      <path fill="#EA4335" d="M13.4 12l3.3 3.3-11.5 6.4c-.6.3-1.2.3-1.6 0L13.4 12Z" />
    </svg>
  )
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.5 2-3.7 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4ZM14 5.2c.7-.8 1.1-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3.1 1.1.1 2.2-.6 2.9-1.4Z"
      />
    </svg>
  )
}
