'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { SelectForm } from '@/components/form/select-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { INDONESIA_REGENCIES } from '@/features/others/regencies/form/options'
import { useCheckParentProvinceQuery, useSaveRegencyMutation } from '@/hooks/others/use-regencies'
import { regencyFormSchema } from '@/schemas/others/regency-schema'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegencyActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: RegencyRecord | null
}

export function RegencyActionDialog({ open, onOpenChange, currentRow }: RegencyActionDialogProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('regional.regencies')
  const { mutateAsync: saveRegency, isPending } = useSaveRegencyMutation()

  const form = useForm<RegencyFormValues>({
    resolver: zodResolver(regencyFormSchema),
    defaultValues: {
      id: currentRow?.id,
      is_domestic: true,
      name: currentRow?.name || '',
      code: (currentRow?.code as string) || '',
      alias: (currentRow?.alias as string) || '',
      description: (currentRow?.description as string) || '',
      country_id: 100,
      state_id: currentRow?.state_id ? currentRow.state_id[0] : undefined,
      province_name_raw: '',
      province_code_raw: '',
      auto_add_province: true,
      latitude: currentRow?.latitude || -7.321,
      longitude: currentRow?.longitude || 110.123
    }
  })

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          id: currentRow.id,
          is_domestic: true,
          name: currentRow.name,
          code: (currentRow.code as string) || '',
          alias: (currentRow.alias as string) || '',
          description: (currentRow.description as string) || '',
          country_id: 100,
          state_id: currentRow.state_id ? currentRow.state_id[0] : undefined,
          province_name_raw: '',
          province_code_raw: '',
          auto_add_province: true,
          latitude: currentRow.latitude || -7.321,
          longitude: currentRow.longitude || 110.123
        })
      } else {
        form.reset({
          id: undefined,
          is_domestic: true,
          name: '',
          code: '',
          alias: '',
          description: '',
          country_id: 100,
          state_id: undefined,
          province_name_raw: '',
          province_code_raw: '',
          auto_add_province: true,
          latitude: -7.321,
          longitude: 110.123
        })
      }
    }
  }, [open, currentRow, form])

  const selectedProvName = form.watch('province_name_raw') || ''
  const selectedProvCode = form.watch('province_code_raw') || ''
  const autoAddProvince = form.watch('auto_add_province')

  const { data: parentStatus, isLoading: isCheckingParent } = useCheckParentProvinceQuery(selectedProvName, selectedProvCode)

  useEffect(() => {
    if (parentStatus?.exists && parentStatus.id) {
      form.setValue('state_id', parentStatus.id, { shouldValidate: true })
    } else if (parentStatus && !parentStatus.exists) {
      form.setValue('state_id', undefined)
    }
  }, [parentStatus, form])

  const handleSelectDomestic = (regCode: string) => {
    const found = INDONESIA_REGENCIES.find((r) => r.code === regCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('province_name_raw', found.provinceName, { shouldValidate: true })
      form.setValue('province_code_raw', found.provinceCode, { shouldValidate: true })
      form.setValue('latitude', found.latitude, { shouldValidate: true })
      form.setValue('longitude', found.longitude, { shouldValidate: true })
    }
  }

  const onSubmit = async (values: RegencyFormValues) => {
    try {
      const res = await saveRegency(values)
      if (res.success) {
        toast.success(isEdit ? 'Kabupaten/Kota berhasil diperbarui' : 'Kabupaten/Kota berhasil didaftarkan')
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(res.error || 'Gagal menyimpan kabupaten')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data')
    }
  }

  const isSubmitLocked = !isEdit && selectedProvName && parentStatus && !parentStatus.exists && !autoAddProvince

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      formId="regency-action-form"
      isEdit={isEdit}
      isPending={isPending}
      submitDisabled={Boolean(isSubmitLocked)}
      title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
      description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
      maxWidth="sm:max-w-xl"
    >
      <Form {...form}>
        <form id="regency-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
          {!isEdit && (
            <div className="grid grid-cols-6 items-center gap-x-3 gap-y-1">
              <label className="text-muted-foreground col-span-2 text-end text-xs font-medium">Katalog 514 Kab/Kota</label>
              <div className="col-span-4">
                <SelectForm
                  placeholder="Pilih Kabupaten / Kota..."
                  disabled={isPending}
                  onValueChange={handleSelectDomestic}
                  items={INDONESIA_REGENCIES.map((r) => ({
                    label: `${r.name} (${r.provinceName})`,
                    value: r.code
                  }))}
                />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Kabupaten/Kota" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-3 gap-y-1">
                <FormLabel className="col-span-2 text-end text-xs font-medium">{t('table.code')}</FormLabel>
                <FormControl>
                  <Input placeholder="Kode (e.g. 33.23)" className="col-span-4 text-xs" disabled={isPending} {...field} />
                </FormControl>
                <FormMessage className="col-span-4 col-start-3 text-xs" />
              </FormItem>
            )}
          />

          {selectedProvName && (
            <div className="border-border/80 bg-muted/40 space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Provinsi Induk: {selectedProvName}</span>
                {isCheckingParent ? (
                  <span className="text-muted-foreground text-[10px]">Memeriksa Odoo...</span>
                ) : parentStatus?.exists ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                    <CheckCircle2 className="size-3.5" /> Terdaftar di Odoo
                  </span>
                ) : (
                  <span className="text-destructive flex items-center gap-1 text-[11px]">
                    <AlertCircle className="size-3.5" /> Belum Terdaftar
                  </span>
                )}
              </div>

              {!isCheckingParent && parentStatus && !parentStatus.exists && (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertCircle className="size-4" />
                  <AlertTitle className="text-xs font-bold">Provinsi Belum Terdaftar</AlertTitle>
                  <AlertDescription className="text-[11px]">Provinsi {selectedProvName} belum ada di master data Odoo.</AlertDescription>
                  <div className="border-destructive/20 mt-2 flex items-center justify-between border-t pt-2">
                    <span className="text-foreground text-[11px] font-semibold">Otomatis daftarkan Provinsi ke Odoo:</span>
                    <Switch checked={autoAddProvince} onCheckedChange={(checked) => form.setValue('auto_add_province', checked)} />
                  </div>
                </Alert>
              )}
            </div>
          )}

          <div className="grid grid-cols-6 items-center gap-x-3 gap-y-1">
            <span className="text-muted-foreground col-span-2 text-end text-xs font-medium">Centroid GPS</span>
            <div className="col-span-4 grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.0001"
                placeholder="Lat"
                className="text-xs"
                disabled={isPending}
                {...form.register('latitude', { valueAsNumber: true })}
              />
              <Input
                type="number"
                step="0.0001"
                placeholder="Lng"
                className="text-xs"
                disabled={isPending}
                {...form.register('longitude', { valueAsNumber: true })}
              />
            </div>
          </div>
        </form>
      </Form>
    </ActionDialog>
  )
}
