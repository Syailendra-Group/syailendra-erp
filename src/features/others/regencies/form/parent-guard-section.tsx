'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import type { ReactElement } from 'react'

export interface ParentGuardSectionProps {
  provinceName: string
  provinceExists: boolean
  isChecking: boolean
  autoAddProvince: boolean
  onAutoAddChange: (checked: boolean) => void
  disabled?: boolean
}

export function ParentGuardSection({
  provinceName,
  provinceExists,
  isChecking,
  autoAddProvince,
  onAutoAddChange,
  disabled
}: ParentGuardSectionProps): ReactElement | null {
  const t = useTranslations('regional.regencies.alert')

  if (!provinceName || isChecking) {
    return null
  }

  if (provinceExists) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4 shrink-0" />
        <span className="font-medium">Provinsi induk &quot;{provinceName}&quot; telah terdaftar aktif di Odoo 18.</span>
      </div>
    )
  }

  return (
    <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
      <AlertTriangle className="size-4 shrink-0" />
      <AlertTitle className="text-xs font-bold">{t('parentMissingTitle')}</AlertTitle>
      <AlertDescription className="space-y-3 pt-1 text-xs">
        <p className="leading-relaxed">
          {t('parentMissingDesc', { province: provinceName })} Tombol simpan akan terkunci sampai Anda mengaktifkan opsi pendaftaran otomatis di
          bawah.
        </p>

        <div className="border-destructive/20 bg-background/80 flex items-center gap-3 rounded-md border p-2.5 shadow-2xs">
          <Switch id="auto_add_province_switch" checked={autoAddProvince} onCheckedChange={onAutoAddChange} disabled={disabled} />
          <Label htmlFor="auto_add_province_switch" className="text-foreground cursor-pointer text-xs font-semibold">
            {t('autoAddLabel', { province: provinceName })}
          </Label>
        </div>
      </AlertDescription>
    </Alert>
  )
}
