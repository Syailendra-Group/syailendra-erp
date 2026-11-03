'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useSaveFarmerMutation } from '@/hooks/traceability/use-farmers'
import { Link, useRouter } from '@/i18n/navigation'
import { farmerFormSchema } from '@/schemas/traceability/farmer-schema'

import { CommoditySection } from './commodity-section'
import { IdentitySection } from './identity-section'
import { LocationSection } from './location-section'
import { NotesSection } from './notes-section'
import { getCommodityOptions, getFarmingMethodOptions } from './options'
import { TerroirSection } from './terroir-section'

import type { FarmerFormValues } from '@/schemas/traceability/farmer-schema'
import type { MapCoordinates } from '@/types/components/map'
import type { FarmerRecord } from '@/types/traceability/farmer'
import type { ReactElement } from 'react'

export interface FarmerFormProps {
  initialData?: FarmerRecord | null
}

export function FarmerForm({ initialData }: FarmerFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const tTrace = useTranslations('traceability.farmers')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveFarmer, isPending } = useSaveFarmerMutation()

  const [centroidPan, setCentroidPan] = useState<MapCoordinates | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      id: initialData?.id,
      ref: initialData?.ref || 'FMR-JTG-001',
      name: initialData?.name || '',
      vat: (initialData?.vat as string) || '',
      phone: (initialData?.phone as string) || '',
      email: (initialData?.email as string) || '',
      state_id: initialData?.state_id ? initialData.state_id[0] : 100, // Jawa Tengah default
      city_id: initialData?.city_id ? initialData.city_id[0] : undefined,
      district_id: initialData?.district_id ? initialData.district_id[0] : undefined,
      subdistrict_id: initialData?.subdistrict_id ? initialData.subdistrict_id[0] : undefined,
      address_detail: (initialData?.address_detail as string) || '',
      street: initialData?.street || 'Wonosobo',
      city: initialData?.city || 'Wonosobo',
      partner_latitude: initialData?.partner_latitude ?? -7.2145,
      partner_longitude: initialData?.partner_longitude ?? 109.9124,
      commodity: initialData?.commodity || 'gaharu',
      farming_method: initialData?.farming_method || 'organic',
      land_area_m2: initialData?.land_area_m2 ?? 2500,
      comment: (initialData?.comment as string) || ''
    }
  })

  const commodityOptions = getCommodityOptions(tTrace)
  const methodOptions = getFarmingMethodOptions(tTrace)

  const onSubmit = async (values: FarmerFormValues) => {
    try {
      const res = await saveFarmer(values)
      if (res.success) {
        toast.success(tTrace('messages.saved'))
        router.push('/traceability/farmers')
        router.refresh()
      } else {
        toast.error(res.error || tTrace('messages.saveFailed'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tTrace('messages.saveFailed')
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/traceability/farmers"
        backLabel={tTrace('detail.back')}
        title={isEdit ? tTrace('dialog.editTitle') : tTrace('dialog.addTitle')}
        description={isEdit ? tTrace('dialog.editDesc') : tTrace('dialog.addDesc')}
      />

      <form id="farmer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          {/* Identitas Kemitraan */}
          <IdentitySection register={register} errors={errors} isPending={isPending} />

          {/* Domisili & Wilayah Binaan (Cascading Regional Selector) */}
          <LocationSection
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            isPending={isPending}
            onCentroidChange={setCentroidPan}
          />

          {/* Komoditas Pertanian */}
          <CommoditySection
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            commodityOptions={commodityOptions}
            methodOptions={methodOptions}
            isPending={isPending}
          />

          {/* Terroir & Geotagging GPS (Interactive Map Picker) */}
          <TerroirSection register={register} errors={errors} watch={watch} setValue={setValue} isPending={isPending} centroidPan={centroidPan} />

          {/* Catatan Agronomi */}
          <div className="lg:col-span-2">
            <NotesSection register={register} isPending={isPending} />
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="border-border/60 bg-background/90 sticky bottom-4 z-20 flex items-center justify-between rounded-xl border p-3 shadow-md backdrop-blur-md">
          <Button variant="outline" asChild>
            <Link href="/traceability/farmers">{tCommon('actions.cancel')}</Link>
          </Button>
          <Button type="submit" form="farmer-form" disabled={isPending} className="gap-2 font-semibold">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : tTrace('primaryAction')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
