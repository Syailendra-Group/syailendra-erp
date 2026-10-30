'use client'

import * as React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { LoginForm } from './form'

export function LoginPage(): React.ReactElement {
  const tAuth = useTranslations('auth')

  return (
    <main className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors sm:p-6">
      {/* Top right language & theme bar */}
      <aside className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </aside>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header with DDistillers Logo */}
        <header className="flex flex-col items-center space-y-3 text-center">
          <div className="border-border/50 bg-card/60 flex items-center justify-center rounded-2xl border px-5 py-3 shadow-xs backdrop-blur-xs">
            <Image
              src="/images/ddistillers-logo.png"
              alt="DDistillers — PT. Syailendra Bumi Investama"
              width={240}
              height={38}
              priority
              className="h-9 w-auto object-contain dark:brightness-125 dark:contrast-125"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Syailendra Group</h1>
            <p className="text-muted-foreground text-xs">{tAuth('subtitle')}</p>
          </div>
        </header>

        {/* Login Card */}
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-bold">{tAuth('title')}</CardTitle>
            <CardDescription className="text-xs">{tAuth('fields.email_placeholder')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer legal notes */}
        <footer className="text-muted-foreground/70 text-center text-xs">
          &copy; {new Date().getFullYear()} Syailendra Group (DDistillers). All rights reserved.
        </footer>
      </div>
    </main>
  )
}
