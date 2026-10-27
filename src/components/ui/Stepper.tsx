import { cn } from '../../lib/cn'
import { CheckIcon } from '../icons'

interface StepperProps {
  steps: readonly string[]
  /** Index of the active step; steps before it render as complete. Use steps.length for all-complete. */
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span className="flex items-center gap-1.5" aria-current={active ? 'step' : undefined}>
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                  done && 'bg-navy-700 text-white',
                  active && 'bg-navy-900 text-white',
                  !done && !active && 'border border-line text-muted',
                )}
              >
                {done ? <CheckIcon className="size-3" /> : i + 1}
              </span>
              <span className={cn('text-[11px] font-medium', done || active ? 'text-navy-900' : 'text-muted/70')}>
                {label}
                <span className="sr-only">{done ? ' (complete)' : active ? ' (current)' : ''}</span>
              </span>
            </span>
            {i < steps.length - 1 && <span aria-hidden="true" className="h-px flex-1 bg-line" />}
          </li>
        )
      })}
    </ol>
  )
}
