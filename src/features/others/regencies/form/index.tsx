'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useProvincesQuery } from '@/hooks/others/use-provinces'
import { useCheckParentProvinceQuery, useSaveRegencyMutation } from '@/hooks/others/use-regencies'
import { Link, useRouter } from '@/i18n/navigation'
import { regencyFormSchema } from '@/schemas/others/regency-schema'

import { CentroidSection } from './centroid-section'
import { IdentitySection } from './identity-section'
import { ParentGuardSection } from './parent-guard-section'

import type { RegencyFormValues } from '@/schemas/others/regency-schema'
import type { RegencyRecord } from '@/types/others/regency'
import type { ReactElement } from 'react'

export interface RegencyFormProps {
  initialData?: RegencyRecord | null
}

export function RegencyForm({ initialData }: RegencyFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const t = useTranslations('regional.regencies')
  const tCommon = useTranslations('common')

  const { data: provinces = [] } = useProvincesQuery(100)
  const { mutateAsync: saveRegency, isPending } = useSaveRegencyMutation()

  const [selectedProvinceName, setSelectedProvinceName] = useState<string>(initialData?.state_id ? initialData.state_id[1] : 'Jawa Tengah')
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>('JT')

  const { data: parentCheck, isLoading: isCheckingParent } = useCheckParentProvinceQuery(
    selectedProvinceName,
    selectedProvinceCode,
    !isEdit && Boolean(selectedProvinceName)
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RegencyFormValues>({
    resolver: zodResolver(regencyFormSchema),
    defaultValues: {
      id: initialData?.id,
      is_domestic: true,
      name: initialData?.name || '',
      code: (initialData?.code as string) || '',
      alias: (initialData?.alias as string) || '',
      description: (initialData?.description as string) || '',
      country_id: initialData?.country_id ? initialData.country_id[0] : 100,
      state_id: initialData?.state_id ? initialData.state_id[0] : undefined,
      province_name_raw: selectedProvinceName,
      province_code_raw: selectedProvinceCode,
      auto_add_province: false,
      latitude: initialData?.latitude || -7.3167,
      longitude: initialData?.longitude || 110.1667
    }
  })

  const autoAddProvince = watch('auto_add_province')
  const currentStateId = watch('state_id')

  // Parent is missing if not in Odoo states and not an edit mode
  const parentExists = Boolean(currentStateId) || Boolean(parentCheck?.exists)
  const isParentMissing = !parentExists && Boolean(selectedProvinceName)
  const canSubmit = !isParentMissing || autoAddProvince

  const onSubmit = async (values: RegencyFormValues) => {
    if (isParentMissing && !values.auto_add_province) {
      toast.error('Provinsi induk belum terdaftar. Aktifkan sakelar pendaftaran otomatis untuk melanjutkan.')
      return
    }

    try {
      const res = await saveRegency(values)
      if (res.success) {
        toast.success(isEdit ? 'Kabupaten/Kota berhasil diperbarui' : 'Kabupaten/Kota berhasil didaftarkan')
        router.push('/others/regencies')
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menyimpan kabupaten/kota')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan kabupaten/kota')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/regencies"
        backLabel="Kembali ke Daftar Kab/Kota"
        title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
      />

      <form id="regency-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="max-w-4xl space-y-5">
          {/* Smart Parent Guard Alert */}
          <ParentGuardSection
            provinceName={selectedProvinceName}
            provinceExists={parentExists}
            isChecking={isCheckingParent}
            autoAddProvince={autoAddProvince}
            onAutoAddChange={(checked) => setValue('auto_add_province', checked)}
            disabled={isPending}
          />

          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
            <IdentitySection
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              provinces={provinces}
              isPending={isPending}
              onProvinceSelectChange={(pName, pCode) => {
                setSelectedProvinceName(pName)
                setSelectedProvinceCode(pCode)
                setValue('province_name_raw', pName)
                setValue('province_code_raw', pCode)
              }}
            />

            <CentroidSection register={register} errors={errors} isPending={isPending} />
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-border/60 bg-background/90 sticky bottom-4 z-20 flex max-w-4xl items-center justify-between rounded-xl border p-3 shadow-md backdrop-blur-md">
          <Button variant="outline" asChild>
            <Link href="/others/regencies">{tCommon('actions.cancel')}</Link>
          </Button>
          <Button type="submit" form="regency-form" disabled={isPending || !canSubmit} className="cursor-pointer gap-2 font-semibold">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : t('primaryAction')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
