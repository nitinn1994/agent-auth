import type { ReactNode } from 'react'

export function Alert({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
    >
      <span>{children}</span>
      {action}
    </div>
  )
}
