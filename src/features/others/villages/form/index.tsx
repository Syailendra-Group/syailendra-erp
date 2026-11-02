'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Navigation, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { SectionCard } from '@/components/card/section-card'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDistrictsQuery } from '@/hooks/others/use-districts'
import { useSaveVillageMutation } from '@/hooks/others/use-villages'
import { Link, useRouter } from '@/i18n/navigation'
import { villageFormSchema } from '@/schemas/others/village-schema'

import type { VillageFormValues } from '@/schemas/others/village-schema'
import type { VillageRecord } from '@/types/others/village'
import type { ReactElement } from 'react'

export interface VillageFormProps {
  initialData?: VillageRecord | null
}

export function VillageForm({ initialData }: VillageFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const t = useTranslations('regional.villages')
  const tCommon = useTranslations('common')

  const { data: districts = [] } = useDistrictsQuery()
  const { mutateAsync: saveVillage, isPending } = useSaveVillageMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<VillageFormValues>({
    resolver: zodResolver(villageFormSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      code: (initialData?.code as string) || '',
      district_id: initialData?.district_id ? initialData.district_id[0] : districts[0]?.id || 1,
      zip_code: (initialData?.zip_code as string) || '56257',
      latitude: initialData?.latitude || -7.2145,
      longitude: initialData?.longitude || 109.9124
    }
  })

  const currentDistrictId = watch('district_id')

  const onSubmit = async (values: VillageFormValues) => {
    try {
      const res = await saveVillage(values)
      if (res.success) {
        toast.success(isEdit ? 'Kelurahan/Desa berhasil diperbarui' : 'Kelurahan/Desa berhasil didaftarkan')
        router.push('/others/villages')
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menyimpan desa')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan desa')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/villages"
        backLabel="Kembali ke Daftar Desa"
        title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
      />

      <form id="village-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="max-w-2xl">
          <SectionCard
            title="Identitas Kelurahan / Desa"
            description="Informasi desa sentra budidaya dan kode pos posko petani"
            icon={Navigation}
            contentClassName="space-y-4"
          >
            <FormFieldWrapper id="name" label={t('table.name')} required error={errors.name?.message}>
              <Input id="name" placeholder="Nama Kelurahan / Desa (e.g. Ngadirejo)" disabled={isPending} {...register('name')} />
            </FormFieldWrapper>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="code" label="Kode Kemendagri" error={errors.code?.message}>
                <Input id="code" placeholder="Kode (e.g. 33.23.08.2001)" disabled={isPending} {...register('code')} />
              </FormFieldWrapper>

              <FormFieldWrapper id="zip_code" label="Kode Pos Resmi" error={errors.zip_code?.message}>
                <Input id="zip_code" placeholder="Kode Pos (e.g. 56257)" disabled={isPending} {...register('zip_code')} />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper id="district_id" label="Kecamatan Induk" required error={errors.district_id?.message}>
              <SelectForm
                value={currentDistrictId ? String(currentDistrictId) : undefined}
                onValueChange={(val) => setValue('district_id', Number(val), { shouldValidate: true })}
                placeholder="Pilih Kecamatan"
                disabled={isPending}
                items={districts.map((d) => ({
                  label: d.name,
                  value: String(d.id)
                }))}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormFieldWrapper id="latitude" label="Lintang (Latitude)">
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  placeholder="-7.2145"
                  disabled={isPending}
                  {...register('latitude', { valueAsNumber: true })}
                />
              </FormFieldWrapper>
              <FormFieldWrapper id="longitude" label="Bujur (Longitude)">
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  placeholder="109.9124"
                  disabled={isPending}
                  {...register('longitude', { valueAsNumber: true })}
                />
              </FormFieldWrapper>
            </div>
          </SectionCard>
        </div>

        <div className="border-border/60 bg-background/90 sticky bottom-4 z-20 flex max-w-2xl items-center justify-between rounded-xl border p-3 shadow-md backdrop-blur-md">
          <Button variant="outline" asChild>
            <Link href="/others/villages">{tCommon('actions.cancel')}</Link>
          </Button>
          <Button type="submit" form="village-form" disabled={isPending} className="cursor-pointer gap-2 font-semibold">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : t('primaryAction')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
