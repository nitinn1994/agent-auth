import type { ReactNode } from 'react'

export function FieldLabel({ htmlFor, id, children }: { htmlFor?: string; id?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} id={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-navy-900">
      {children}
    </label>
  )
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1.5 text-xs text-red-700">
      {children}
    </p>
  )
}
