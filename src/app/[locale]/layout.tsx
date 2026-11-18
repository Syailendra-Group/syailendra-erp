import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { pickMessages } from '@/utils/i18n'

import type { Metadata } from 'next'

import '@/styles/index.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap'
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    template: '%s | SYAILENDRA ERP',
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
    <html lang={locale} className={`${plusJakartaSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground selection:bg-primary/10 selection:text-primary dark:selection:text-primary min-h-screen antialiased">
        <NextIntlClientProvider messages={pickMessages(messages, ['common', 'nav', 'inventory'])} locale={locale}>
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
