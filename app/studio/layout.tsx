import type { ReactNode } from 'react'
import '../globals.css'
import { Providers } from '../providers'

export default function StudioLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark:bg-darkbg dark:text-white bg-white text-black">
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
