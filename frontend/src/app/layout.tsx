import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Storage Management System',
  description: 'A modern storage management system with file organization, notes, and analytics',
  keywords: 'storage, file management, notes, cloud storage, organization',
  authors: [{ name: 'Storage Management Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}