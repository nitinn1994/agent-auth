import type { ReactNode } from 'react'

interface AuthCardProps {
  eyebrow: string
  title: string
  /** Rendered between the header and the body, e.g. a stepper. */
  progress?: ReactNode
  children: ReactNode
}

export function AuthCard({ eyebrow, title, progress, children }: AuthCardProps) {
  return (
    <main className="flex min-h-dvh items-start justify-center px-4 py-8 sm:items-center sm:py-12">
      <div className="w-full max-w-[420px]">
        <section
          aria-labelledby="auth-card-title"
          className="overflow-hidden rounded-xl bg-white shadow-[0_12px_32px_-12px_rgba(11,26,51,0.25)] ring-1 ring-navy-900/5"
        >
          <header className="bg-navy-900 px-5 pt-6 pb-4 sm:px-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
            <h1 id="auth-card-title" className="mt-1 text-lg font-semibold text-white">
              {title}
            </h1>
          </header>
          {progress && <div className="border-b border-line/70 px-5 py-3.5 sm:px-6">{progress}</div>}
          <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
          <footer className="border-t border-line/60 px-5 py-3 text-center text-[10px] text-muted/80 sm:px-6">
            Pine Labs Prepaid Cards · regulated by Reserve Bank of India
          </footer>
        </section>
      </div>
    </main>
  )
}
