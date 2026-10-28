'use client'

import * as React from 'react'
import { Boxes } from 'lucide-react'
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
        {/* Brand Header */}
        <header className="space-y-2 text-center">
          <div className="border-primary/20 bg-primary/10 text-primary dark:text-primary inline-flex rounded-2xl border p-3 shadow-xs">
            <Boxes className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Syailendra Group</h1>
          <p className="text-muted-foreground text-xs">{tAuth('subtitle')}</p>
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
          &copy; {new Date().getFullYear()} Syailendra Group. All rights reserved.
        </footer>
      </div>
    </main>
  )
}
