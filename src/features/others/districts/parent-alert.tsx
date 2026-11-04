'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'

import type { ReactElement } from 'react'

export interface DistrictParentAlertProps {
  regencyName: string
  isChecking: boolean
  exists: boolean
  autoAdd: boolean
  onAutoAddChange: (checked: boolean) => void
  isDuplicate?: boolean
  duplicateId?: number
  currentName?: string
  tReg: (key: string) => string
}

export function DistrictParentAlert({
  regencyName,
  isChecking,
  exists,
  autoAdd,
  onAutoAddChange,
  isDuplicate,
  duplicateId,
  currentName,
  tReg
}: DistrictParentAlertProps): ReactElement | null {
  return (
    <div className="space-y-2">
      {isDuplicate && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-bold">Kecamatan Sudah Terdaftar</AlertTitle>
          <AlertDescription className="text-[11px]">
            Wilayah {currentName} sudah terdaftar di database sistem (ID: #{duplicateId}). Silakan gunakan data yang sudah ada atau pilih wilayah
            lain.
          </AlertDescription>
        </Alert>
      )}

      {regencyName && (
        <div className="border-border/80 bg-muted/40 space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>
              {tReg('fields.parent')}: {regencyName}
            </span>
            {isChecking ? (
              <span className="text-muted-foreground text-[10px]">{tReg('checkingParent')}</span>
            ) : exists ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <CheckCircle2 className="size-3.5" /> {tReg('parentRegistered')}
              </span>
            ) : (
              <span className="text-destructive flex items-center gap-1 text-[11px]">
                <AlertCircle className="size-3.5" /> {tReg('parentUnregistered')}
              </span>
            )}
          </div>

          {!isChecking && !exists && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertCircle className="size-4" />
              <AlertTitle className="text-xs font-bold">Kabupaten Induk Belum Terdaftar</AlertTitle>
              <AlertDescription className="text-[11px]">
                Kabupaten/Kota {regencyName} untuk kecamatan ini belum ada di master data Odoo.
              </AlertDescription>
              <div className="border-destructive/20 mt-2 flex items-center justify-between border-t pt-2">
                <span className="text-foreground text-[11px] font-semibold">Otomatis daftarkan Kabupaten ke Odoo:</span>
                <Switch checked={autoAdd} onCheckedChange={onAutoAddChange} />
              </div>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
