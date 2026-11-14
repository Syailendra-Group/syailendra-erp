'use client'

import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, RotateCcw, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useResetSiteConfigMutation, useSaveSiteConfigMutation, useSiteConfigQuery } from '@/hooks/others/use-website'
import { createSiteConfigSchema } from '@/schemas/others/website-schema'

import { IdentitySection } from './form/identity-section'
import { LogosSection } from './form/logos-section'
import { ThemePaletteSection } from './form/theme-palette-section'
import { WebsiteSkeleton } from './skeleton'

import type { SiteConfigFormValues } from '@/schemas/others/website-schema'
import type { ReactElement } from 'react'

export function WebsiteFeature(): ReactElement {
  const t = useTranslations('others.website')

  const { data: config, isLoading } = useSiteConfigQuery()
  const saveMutation = useSaveSiteConfigMutation()
  const resetMutation = useResetSiteConfigMutation()

  const schema = useMemo(
    () =>
      createSiteConfigSchema((key, values) => {
        try {
          return t(key, values)
        } catch {
          return key
        }
      }),
    [t]
  )

  const odooFormValues: SiteConfigFormValues | undefined = useMemo(
    () =>
      config
        ? {
            site_name: config.site_name,
            company_name: config.company_name,
            site_descriptor: config.site_descriptor,
            login_tagline: config.login_tagline,
            login_card_title: config.login_card_title,
            login_card_description: config.login_card_description,
            footer_backbone: config.footer_backbone,
            copyright_text: config.copyright_text,
            logo_light: config.logo_light,
            logo_dark: config.logo_dark,
            logo_monogram: config.logo_monogram,
            primary_light: config.primary_light,
            primary_dark: config.primary_dark,
            bg_light: config.bg_light,
            bg_dark: config.bg_dark,
            accent_gold: config.accent_gold
          }
        : undefined,
    [config]
  )

  const form = useForm<SiteConfigFormValues>({
    resolver: zodResolver(schema),
    values: odooFormValues
  })

  const handleResetDefault = () => {
    resetMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success(t('resetSuccess'))
        } else {
          toast.error(res.error || t('saveError'))
        }
      }
    })
  }

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(values, {
      onSuccess: (res) => {
        if (res.success) {
          toast.success(t('saveSuccess'))
        } else {
          toast.error(res.error || t('saveError'))
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : String(err))
      }
    })
  })

  if (isLoading || !config) {
    return <WebsiteSkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Globe}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" disabled={resetMutation.isPending} onClick={handleResetDefault} className="gap-1.5 font-semibold">
              <RotateCcw className="size-4" />
              <span>{t('resetDefault')}</span>
            </Button>
            <LoadingButton type="submit" form="website-form" isLoading={saveMutation.isPending} icon={Save}>
              <span>{t('saveButton')}</span>
            </LoadingButton>
          </div>
        }
      />

      <form onSubmit={onSubmit} id="website-form" className="space-y-5">
        {/* 2-Column Identity & Theme Palette Sections (Preserved from user layout) */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <IdentitySection form={form} t={t} />
          <ThemePaletteSection form={form} t={t} />
        </div>

        {/* Full-Width 3 Logos Section */}
        <LogosSection form={form} t={t} />

        <div className="flex items-center justify-end border-t pt-4">
          <LoadingButton type="submit" isLoading={saveMutation.isPending} icon={Save}>
            <span>{t('saveButton')}</span>
          </LoadingButton>
        </div>
      </form>
    </div>
  )
}
