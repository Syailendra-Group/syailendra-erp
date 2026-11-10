'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { LoginForm } from './form'

import type { ReactElement } from 'react'

export function LoginPage(): ReactElement {
  const tAuth = useTranslations('auth')

  return (
    <main className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors sm:p-6">
      {/* Top right language and theme switchers */}
      <aside className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </aside>

      <div className="w-full max-w-md space-y-6">
        {/* Brand header with official Syailendra Group logo and corporate brand hierarchy */}
        <header className="flex flex-col items-center space-y-3.5 text-center">
          <div className="border-border/50 bg-card/60 flex items-center justify-center rounded-2xl border px-6 py-4 shadow-xs backdrop-blur-xs">
            <Image
              src="/images/syailendra-group-logo.png"
              alt="SYAILENDRA ERP — PT Syailendra Bumi Investama"
              width={240}
              height={182}
              priority
              className="h-14 w-auto object-contain dark:brightness-125 dark:contrast-125"
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{tAuth('productName')}</h1>
            <div className="flex justify-center">
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary font-mono text-[9px] uppercase tracking-wider">
                {tAuth('descriptor')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs font-medium italic">{tAuth('subtitle')}</p>
          </div>
        </header>

        {/* Login credentials card */}
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-bold">{tAuth('title')}</CardTitle>
            <CardDescription className="text-xs">{tAuth('cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Ecosystem sub-descriptor and footer legal notes */}
        <footer className="space-y-1.5 text-center">
          <p className="text-muted-foreground/70 font-mono text-[10px] tracking-wide uppercase">
            {tAuth('digitalBackbone')}
          </p>
          <p className="text-muted-foreground/60 text-[11px]">
            &copy; {new Date().getFullYear()} Syailendra Group. {tAuth('copyright')}
          </p>
        </footer>
      </div>
    </main>
  )
}
