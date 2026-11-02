'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MapPin, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSaveDistrictMutation } from '@/hooks/others/use-districts'
import { useRegenciesQuery } from '@/hooks/others/use-regencies'
import { Link, useRouter } from '@/i18n/navigation'
import { districtFormSchema } from '@/schemas/others/district-schema'

import type { DistrictFormValues } from '@/schemas/others/district-schema'
import type { DistrictRecord } from '@/types/others/district'
import type { ReactElement } from 'react'

export interface DistrictFormProps {
  initialData?: DistrictRecord | null
}

export function DistrictForm({ initialData }: DistrictFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const t = useTranslations('regional.districts')
  const tCommon = useTranslations('common')

  const { data: regencies = [] } = useRegenciesQuery()
  const { mutateAsync: saveDistrict, isPending } = useSaveDistrictMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      code: (initialData?.code as string) || '',
      city_id: initialData?.city_id ? initialData.city_id[0] : regencies[0]?.id || 1,
      latitude: initialData?.latitude || -7.1856,
      longitude: initialData?.longitude || 110.0543
    }
  })

  const currentCityId = watch('city_id')

  const onSubmit = async (values: DistrictFormValues) => {
    try {
      const res = await saveDistrict(values)
      if (res.success) {
        toast.success(isEdit ? 'Kecamatan berhasil diperbarui' : 'Kecamatan berhasil didaftarkan')
        router.push('/others/districts')
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menyimpan kecamatan')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan kecamatan')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/districts"
        backLabel="Kembali ke Daftar Kecamatan"
        title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
      />

      <form id="district-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="max-w-2xl">
          <SectionCard
            title="Identitas Kecamatan"
            description="Informasi wilayah kecamatan dan kabupaten induk"
            icon={MapPin}
            contentClassName="space-y-4"
          >
            <FormFieldWrapper id="name" label={t('table.name')} required error={errors.name?.message}>
              <Input id="name" placeholder="Nama Kecamatan (e.g. Candiroto)" disabled={isPending} {...register('name')} />
            </FormFieldWrapper>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="code" label="Kode Wilayah" error={errors.code?.message}>
                <Input id="code" placeholder="Kode (e.g. 33.23.08)" disabled={isPending} {...register('code')} />
              </FormFieldWrapper>

              <FormFieldWrapper id="city_id" label="Kabupaten / Kota Induk" required error={errors.city_id?.message}>
                <SelectForm
                  value={currentCityId ? String(currentCityId) : undefined}
                  onValueChange={(val) => setValue('city_id', Number(val), { shouldValidate: true })}
                  placeholder="Pilih Kabupaten / Kota"
                  disabled={isPending}
                  items={regencies.map((r) => ({
                    label: r.name,
                    value: String(r.id)
                  }))}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="latitude" label="Lintang (Latitude)">
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  placeholder="-7.1856"
                  disabled={isPending}
                  {...register('latitude', { valueAsNumber: true })}
                />
              </FormFieldWrapper>
              <FormFieldWrapper id="longitude" label="Bujur (Longitude)">
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  placeholder="110.0543"
                  disabled={isPending}
                  {...register('longitude', { valueAsNumber: true })}
                />
              </FormFieldWrapper>
            </div>
          </SectionCard>
        </div>

        <div className="border-border/60 bg-background/90 sticky bottom-4 z-20 flex max-w-2xl items-center justify-between rounded-xl border p-3 shadow-md backdrop-blur-md">
          <Button variant="outline" asChild>
            <Link href="/others/districts">{tCommon('actions.cancel')}</Link>
          </Button>
          <Button type="submit" form="district-form" disabled={isPending} className="cursor-pointer gap-2 font-semibold">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : t('primaryAction')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
