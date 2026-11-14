'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSiteConfigHydration, useSiteConfigQuery } from '@/hooks/others/use-website'

import { LoginForm } from './form'

import type { ReactElement } from 'react'

export function LoginPage(): ReactElement {
  const tAuth = useTranslations('auth')
  useSiteConfigHydration()
  const { data: siteConfig } = useSiteConfigQuery()

  const siteName = siteConfig?.site_name || tAuth('productName')
  const companyName = siteConfig?.company_name || 'Syailendra Group'
  const siteDescriptor = siteConfig?.site_descriptor || tAuth('descriptor')
  const loginTagline = siteConfig?.login_tagline || tAuth('subtitle')
  const cardTitle = siteConfig?.login_card_title || tAuth('title')
  const cardDescription = siteConfig?.login_card_description || tAuth('cardDescription')
  const footerBackbone = siteConfig?.footer_backbone || tAuth('digitalBackbone')
  const copyrightText = siteConfig?.copyright_text || tAuth('copyright')

  const logoLightSrc = siteConfig?.logo_light
    ? `data:image/png;base64,${siteConfig.logo_light}`
    : '/images/branding/syailendra_logo_primary_light.png'

  const logoDarkSrc = siteConfig?.logo_dark ? `data:image/png;base64,${siteConfig.logo_dark}` : '/images/branding/syailendra_logo_secondary_dark.png'

  return (
    <main className="bg-background text-foreground relative flex min-h-screen flex-col items-center justify-center p-4 transition-colors sm:p-6">
      {/* Top right language and theme switchers */}
      <aside className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </aside>

      <div className="w-full max-w-md space-y-6">
        {/* Brand header with official or configured Syailendra Group logo */}
        <header className="flex flex-col items-center space-y-3.5 text-center">
          <div className="border-border/50 bg-card/80 flex items-center justify-center rounded-2xl border px-6 py-4 shadow-xs backdrop-blur-xs">
            <Image
              src={logoLightSrc}
              alt={siteName}
              width={240}
              height={182}
              priority
              unoptimized
              className="block h-14 w-auto object-contain dark:hidden"
            />
            <Image
              src={logoDarkSrc}
              alt={siteName}
              width={240}
              height={182}
              priority
              unoptimized
              className="hidden h-14 w-auto object-contain dark:block"
            />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">{siteName}</h1>
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="border-brand-gold/50 bg-brand-gold/10 text-primary dark:text-brand-gold font-mono text-[9px] tracking-wider uppercase"
              >
                {siteDescriptor}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs font-medium italic">{loginTagline}</p>
          </div>
        </header>

        {/* Login credentials card */}
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="font-heading text-lg font-bold">{cardTitle}</CardTitle>
            <CardDescription className="text-xs">{cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Ecosystem sub-descriptor and footer legal notes */}
        <footer className="space-y-1.5 text-center">
          <p className="text-muted-foreground/70 font-mono text-[10px] tracking-wide uppercase">{footerBackbone}</p>
          <p className="text-muted-foreground/60 text-[11px]">
            &copy; {new Date().getFullYear()} {companyName}. {copyrightText}
          </p>
        </footer>
      </div>
    </main>
  )
}
