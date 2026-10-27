import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'ghost' | 'link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  loadingText?: string
}

const variants: Record<Variant, string> = {
  primary:
    'h-11 w-full rounded-md bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800 disabled:bg-[#a3a8b1] disabled:text-white/90',
  ghost: 'h-10 w-full rounded-md px-4 text-sm font-semibold text-navy-900 hover:bg-navy-900/5',
  link: 'text-xs font-semibold text-link hover:underline disabled:text-muted disabled:no-underline',
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
