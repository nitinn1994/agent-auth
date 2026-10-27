import type { ReactNode } from 'react'
import { AppleIcon, BrandMark, PlayStoreIcon } from '../../../components/icons'
import { Button } from '../../../components/ui/Button'

// Placeholder store listings; replace with the official app links.
const PLAY_STORE_URL = 'https://play.google.com/store/search?q=pine%20labs&c=apps'
const APP_STORE_URL = 'https://apps.apple.com/in/search?term=pine%20labs'

export function NotMemberScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-teal-soft text-brand-teal">
        <BrandMark className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-navy-900">Not a Member Yet?</h2>
      <p className="mt-1.5 max-w-64 text-xs leading-relaxed text-muted">
        Download the app to complete your sign-up and create your account.
      </p>

      <div className="mt-5 flex w-full flex-wrap justify-center gap-2.5">
        <StoreBadge href={PLAY_STORE_URL} icon={<PlayStoreIcon className="size-5" />} caption="GET IT ON" store="Google Play" />
        <StoreBadge href={APP_STORE_URL} icon={<AppleIcon className="size-5" />} caption="Download on the" store="App Store" />
      </div>

      <p className="mt-5 text-[11px] text-muted">Once you&apos;ve signed up in the app, return here to log in.</p>
      <Button variant="ghost" className="mt-2" onClick={onBackToLogin}>
        Back to login
      </Button>
    </div>
  )
}

function StoreBadge({ href, icon, caption, store }: { href: string; icon: ReactNode; caption: string; store: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${caption} ${store}`}
      className="flex h-10 min-w-34 items-center gap-2 rounded-md bg-black px-3 text-left text-white hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
    >
      {icon}
      <span className="leading-none">
        <span className="block text-[8px] uppercase tracking-wide text-white/80">{caption}</span>
        <span className="block text-sm font-semibold">{store}</span>
      </span>
    </a>
  )
}
