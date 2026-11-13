'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Building, Building2, ImagePlus, Trash2, Upload } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

import type { CompanyFormValues } from '@/schemas/others/company-schema'
import type { ChangeEvent, ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface IdentitySectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

export function IdentitySection({ form, t }: IdentitySectionProps): ReactElement {
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = form

  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoBase64 = watch('logo_web')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const base64Content = result.split(',')[1] || ''
        setValue('logo_web', base64Content, { shouldDirty: true })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setValue('logo_web', null, { shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <SectionCard title={t('sections.identity.title')} description={t('sections.identity.subtitle')} icon={Building} contentClassName="space-y-4">
      {/* Integrated Corporate Logo Uploader */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="bg-muted/40 relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed p-2">
          {logoBase64 ? (
            <Image src={`data:image/png;base64,${logoBase64}`} alt="Corporate Logo" fill unoptimized className="object-contain p-2" />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-1 text-center">
              <Building2 className="size-8 opacity-40" />
              <span className="text-[10px] leading-tight">{t('fields.usesDefaultLogo')}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="text-xs font-semibold">{t('sections.logo.title')}</div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
          <p className="text-muted-foreground text-xs leading-relaxed">{t('fields.dragDrop')}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
              {logoBase64 ? <ImagePlus className="size-4" /> : <Upload className="size-4" />}
              <span>{logoBase64 ? t('fields.changeLogo') : t('fields.uploadLogo')}</span>
            </Button>
            {logoBase64 && (
              <Button type="button" variant="ghost" onClick={handleRemove} className="text-destructive hover:text-destructive gap-1.5">
                <Trash2 className="size-4" />
                <span>{t('fields.removeLogo')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Core Corporate Identity Fields */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormFieldWrapper id="short_name" label={t('fields.shortName')} required error={errors.short_name?.message} className="sm:col-span-1">
          <Input id="short_name" placeholder={t('fields.shortNamePlaceholder')} maxLength={30} {...register('short_name')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="name" label={t('fields.name')} required error={errors.name?.message} className="sm:col-span-2">
          <Input id="name" placeholder={t('fields.namePlaceholder')} maxLength={120} {...register('name')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="tagline" label={t('fields.tagline')} error={errors.tagline?.message}>
        <Input id="tagline" placeholder={t('fields.taglinePlaceholder')} maxLength={200} {...register('tagline')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="currency" label={t('fields.currency')}>
        <Input id="currency" value={t('fields.currencyValue')} disabled className="bg-muted text-muted-foreground font-mono text-xs" />
      </FormFieldWrapper>
    </SectionCard>
  )
}
