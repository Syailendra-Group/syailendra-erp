'use client'

import { useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AddressSection } from '@/components/form/address-section'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useSaveFarmerMutation } from '@/hooks/scm/use-farmers'
import { useRouter } from '@/i18n/navigation'
import { getFarmerFormSchema } from '@/schemas/scm/farmer-schema'

import { CommoditySection } from './commodity-section'
import { IdentitySection } from './identity-section'
import { NotesSection } from './notes-section'
import { getCommodityOptions, getFarmingMethodOptions } from './options'

import type { FarmerFormValues } from '@/schemas/scm/farmer-schema'
import type { AddressFormState } from '@/types/components/address'
import type { FarmerRecord } from '@/types/scm/farmer'
import type { ReactElement } from 'react'

export interface FarmerFormProps {
  initialData?: FarmerRecord | null
}

export function FarmerForm({ initialData }: FarmerFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const tTrace = useTranslations('scm.farmers')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveFarmer, isPending } = useSaveFarmerMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FarmerFormValues>({
    resolver: zodResolver(getFarmerFormSchema(tTrace)),
    defaultValues: {
      id: initialData?.id,
      ref: initialData?.ref || 'FMR-JTG-001',
      name: initialData?.name || '',
      vat: (initialData?.vat as string) || '',
      phone: (initialData?.phone as string) || '',
      email: (initialData?.email as string) || '',
      country_id: 100, // Indonesia default
      state_id: initialData?.state_id ? initialData.state_id[0] : 100, // Jawa Tengah default
      city_id: initialData?.city_id ? initialData.city_id[0] : undefined,
      district_id: initialData?.district_id ? initialData.district_id[0] : undefined,
      subdistrict_id: initialData?.subdistrict_id ? initialData.subdistrict_id[0] : undefined,
      address_detail: (initialData?.address_detail as string) || '',
      address_benchmark: '',
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

  // Watch address state for reusable AddressSection
  const addressValues: AddressFormState = {
    country_id: watch('country_id'),
    state_id: watch('state_id'),
    city_id: watch('city_id'),
    district_id: watch('district_id'),
    subdistrict_id: watch('subdistrict_id'),
    zip_code: watch('zip_code'),
    street: watch('street'),
    address_detail: watch('address_detail'),
    address_benchmark: watch('address_benchmark'),
    latitude: watch('partner_latitude'),
    longitude: watch('partner_longitude')
  }

  const handleAddressChange = useCallback(
    (updates: Partial<AddressFormState>) => {
      Object.entries(updates).forEach(([key, val]) => {
        if (key === 'latitude') {
          setValue('partner_latitude', val as number, { shouldValidate: true, shouldDirty: true })
        } else if (key === 'longitude') {
          setValue('partner_longitude', val as number, { shouldValidate: true, shouldDirty: true })
        } else {
          setValue(key as keyof FarmerFormValues, val as string | number | undefined, {
            shouldValidate: true,
            shouldDirty: true
          })
        }
      })
    },
    [setValue]
  )

  const onSubmit = async (values: FarmerFormValues) => {
    try {
      const res = await saveFarmer(values)
      if (res.success) {
        toast.success(tTrace('messages.saved'))
        router.push('/scm/farmers')
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
        showBack
        backHref="/scm/farmers"
        title={isEdit ? tTrace('dialog.editTitle') : tTrace('dialog.addTitle')}
        description={isEdit ? tTrace('dialog.editDesc') : tTrace('dialog.addDesc')}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="h-8 cursor-pointer text-xs" onClick={() => router.push('/scm/farmers')}>
              {tCommon('actions.cancel')}
            </Button>
            <Button type="submit" form="farmer-form" size="sm" disabled={isPending} className="h-8 cursor-pointer text-xs font-semibold">
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  <span>{tCommon('actions.loading')}</span>
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  <span>{isEdit ? tCommon('actions.save') : tTrace('primaryAction')}</span>
                </>
              )}
            </Button>
          </div>
        }
      />

      <form id="farmer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <IdentitySection register={register} errors={errors} isPending={isPending} />

          <CommoditySection
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            commodityOptions={commodityOptions}
            methodOptions={methodOptions}
            isPending={isPending}
          />

          <div className="lg:col-span-2">
            <AddressSection
              disabled={isPending}
              values={addressValues}
              onChange={handleAddressChange}

              errors={{
                ...(errors.state_id ? { state_id: errors.state_id } : {}),
                ...(errors.city_id ? { city_id: errors.city_id } : {}),
                ...(errors.subdistrict_id ? { subdistrict_id: errors.subdistrict_id } : {}),
                ...(errors.partner_latitude ? { latitude: errors.partner_latitude } : {}),
                ...(errors.partner_longitude ? { longitude: errors.partner_longitude } : {})
              }}
            />
          </div>

          <div className="lg:col-span-2">
            <NotesSection register={register} isPending={isPending} />
          </div>
        </div>
      </form>
    </div>
  )
}
