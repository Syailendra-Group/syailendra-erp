'use client'

import { useRef } from 'react'
import { Building2, ImagePlus, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { CompanyFormValues } from '@/schemas/sbi/others/company-schema'
import type { ChangeEvent, ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface LogoUploadSectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

export function LogoUploadSection({ form, t }: LogoUploadSectionProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoBase64 = form.watch('logo_web')

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
        form.setValue('logo_web', base64Content, { shouldDirty: true })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    form.setValue('logo_web', null, { shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">{t('sections.logo.title')}</CardTitle>
        <CardDescription className="text-xs">{t('sections.logo.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="bg-muted/40 flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed p-2">
            {logoBase64 ? (
              <img src={`data:image/png;base64,${logoBase64}`} alt="Corporate Logo" className="h-full w-full object-contain" />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-1 text-center">
                <Building2 className="size-8 opacity-40" />
                <span className="text-[10px] leading-tight">{t('fields.usesDefaultLogo')}</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
            <p className="text-muted-foreground text-xs leading-relaxed">{t('fields.dragDrop')}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
                {logoBase64 ? <ImagePlus className="size-3.5" /> : <Upload className="size-3.5" />}
                <span>{logoBase64 ? t('fields.changeLogo') : t('fields.uploadLogo')}</span>
              </Button>
              {logoBase64 && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive gap-1.5">
                  <Trash2 className="size-3.5" />
                  <span>{t('fields.removeLogo')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
