'use client'

import { Image as ImageIcon } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { FileDropzone } from '@/components/image/file-dropzone'

import type { SiteConfigFormValues } from '@/schemas/others/website-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface LogosSectionProps {
  form: UseFormReturn<SiteConfigFormValues>
  t: (key: string) => string
}

export function LogosSection({ form, t }: LogosSectionProps): ReactElement {
  const { watch, setValue } = form

  const logoLight = watch('logo_light')
  const logoDark = watch('logo_dark')
  const logoMonogram = watch('logo_monogram')

  return (
    <SectionCard title={t('sections.logos.title')} description={t('sections.logos.subtitle')} icon={ImageIcon} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Light Mode Logo */}
        <div className="flex flex-col items-start space-y-2">
          <div>
            <span className="block text-xs font-semibold">{t('logos.light')}</span>
            <span className="text-muted-foreground text-[11px]">{t('logos.lightDesc')}</span>
          </div>
          <FileDropzone
            value={logoLight}
            onChange={(b64) => setValue('logo_light', (b64 as string) || null, { shouldDirty: true })}
            valueMode="base64"
            aspectRatio={4 / 3}
          />
        </div>

        {/* Dark Mode Logo */}
        <div className="flex flex-col items-start space-y-2">
          <div>
            <span className="block text-xs font-semibold">{t('logos.dark')}</span>
            <span className="text-muted-foreground text-[11px]">{t('logos.darkDesc')}</span>
          </div>
          <FileDropzone
            value={logoDark}
            onChange={(b64) => setValue('logo_dark', (b64 as string) || null, { shouldDirty: true })}
            valueMode="base64"
            aspectRatio={4 / 3}
          />
        </div>

        {/* Monogram / Sidebar Icon */}
        <div className="flex flex-col items-start space-y-2">
          <div>
            <span className="block text-xs font-semibold">{t('logos.monogram')}</span>
            <span className="text-muted-foreground text-[11px]">{t('logos.monogramDesc')}</span>
          </div>
          <FileDropzone
            value={logoMonogram}
            onChange={(b64) => setValue('logo_monogram', (b64 as string) || null, { shouldDirty: true })}
            valueMode="base64"
            aspectRatio={1}
          />
        </div>
      </div>
    </SectionCard>
  )
}
