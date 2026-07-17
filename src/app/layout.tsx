import type { Metadata, Viewport } from 'next'
import { Intel_One_Mono } from 'next/font/google'
import Header from '@/components/layout/Header'
import SiteThemeProvider from '@/components/theme/SiteThemeProvider'
import './globals.css'

const intelMono = Intel_One_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-intel-mono',
})

export const metadata: Metadata = {
  title: 'Etsu — Portfolio',
  description: 'Designer & Developer portfolio',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${intelMono.variable} h-full`}
      data-site-theme="light"
    >
      <body
        className="min-h-full flex flex-col"
        data-simple-nav-inverted="false"
      >
        <SiteThemeProvider>
          <Header />
          {children}
        </SiteThemeProvider>
      </body>
    </html>
  )
}
