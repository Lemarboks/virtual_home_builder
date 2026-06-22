import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haven Pro — Virtual Home Designer',
  description: 'Design your dream property in 3D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-zinc-950">
      <body className="h-full">{children}</body>
    </html>
  )
}
