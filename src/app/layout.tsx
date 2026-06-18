import type { Metadata } from 'next'
import { Geist, Intel_One_Mono } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

const intelMono = Intel_One_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-intel-mono',
})

export const metadata: Metadata = {
  title: 'Etsu — Portfolio',
  description: 'Designer & Developer portfolio',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Temporary diagnostic: use natural document scrolling.
    <html lang="en" className={`${geist.variable} ${intelMono.variable}`}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
