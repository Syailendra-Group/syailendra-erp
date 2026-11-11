import { Libre_Baskerville, Public_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

import type { Metadata } from 'next'

import '@/styles/index.css'

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap'
})

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-libre-baskerville',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    template: '%s • SYAILENDRA ERP',
    default: 'SYAILENDRA ERP — Smarter Systems, Stronger Businesses.'
  },
  description: 'Integrated Business Management Platform — A Digital Backbone for the Syailendra Group Ecosystem',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
}

export interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps): Promise<React.ReactElement> {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${publicSans.variable} ${libreBaskerville.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground selection:bg-primary/10 selection:text-primary dark:selection:text-primary min-h-screen antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={true}>
            <QueryProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
