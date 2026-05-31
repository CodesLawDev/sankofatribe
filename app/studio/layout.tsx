import type { ReactNode } from 'react'

export const metadata = {
  title: 'Sankofa Tribe Studio',
  robots: { index: false, follow: false },
}

/**
 * Sanity Studio shares the single root <html>/<body> from app/layout.tsx.
 * This layout MUST NOT render its own <html>/<body>: nested document tags are
 * invalid HTML, the browser strips/relocates them, and the resulting DOM no
 * longer matches React's tree — which makes Studio crash with
 * "NotFoundError: Failed to execute 'removeChild' on 'Node'".
 * Storefront chrome (header/footer/popups) is hidden on /studio via
 * components/storefront-chrome.tsx so Studio renders full-screen.
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
