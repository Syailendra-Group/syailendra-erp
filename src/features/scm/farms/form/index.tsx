/**
 * index.tsx — Farm create/edit form with document-aligned pill sections
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { PillTabs } from '@/components/button/pill-tabs'
import { AddressSection } from '@/components/form/address-section'
import { MediaSection } from '@/components/image/media-section'
import { PageHeader } from '@/components/shared/page-header'
import { Form } from '@/components/ui/form'
import { useCommodityOptions } from '@/hooks/scm/use-commodities'
import { useCreateFarm, useFarmPartnerOptions, useUpdateFarm } from '@/hooks/scm/use-farms'
import { useRouter } from '@/i18n/navigation'
import { getFarmFormSchema } from '@/schemas/scm/farm-schema'

import { CultivationSection } from './cultivation-section'
import { IdentitySection } from './identity-section'
import { SustainabilitySection } from './sustainability-section'
import { TerroirSection } from './terroir-section'

import type { FarmFormValues } from '@/schemas/scm/farm-schema'
import type { AddressFormState } from '@/types/components/address'
import type { FarmRecord } from '@/types/scm/farm'
import type { ReactElement } from 'react'

export interface FarmFormProps {
  initialData?: FarmRecord | null
}

const SECTION_IDS = ['identity', 'terroir', 'cultivation', 'sustainability'] as const
type FarmSectionId = (typeof SECTION_IDS)[number]

export function FarmForm({ initialData }: FarmFormProps): ReactElement {
  const isEdit = Boolean(initialData)
  const t = useTranslations('scm.farms')
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<FarmSectionId>('identity')

  const { data: partnerOptions = [] } = useFarmPartnerOptions()
  const { data: commodityOptions = [] } = useCommodityOptions()
  const createMutation = useCreateFarm()
  const updateMutation = useUpdateFarm()

  const form = useForm<FarmFormValues>({
    resolver: zodResolver(getFarmFormSchema(t)),
    defaultValues: {
      name: initialData?.name ?? '',
      code: initialData?.code ?? '',
      partner_id: initialData?.partnerId ?? undefined,
      crop_ids: initialData?.cropIds ?? [],
      country_id: initialData?.countryId ?? 100,
      state_id: initialData?.stateId ?? undefined,
      city_id: initialData?.cityId ?? undefined,
      district_id: initialData?.districtId ?? undefined,
      subdistrict_id: initialData?.subdistrictId ?? undefined,
      address_detail: initialData?.addressDetail ?? '',
      latitude: initialData?.latitude ?? undefined,
      longitude: initialData?.longitude ?? undefined,
      elevation_mdpl: initialData?.elevationMdpl ?? undefined,
      area_ha: initialData?.areaHa ?? undefined,
      farming_system: initialData?.farmingSystem ?? 'conventional',
      uses_pesticide: initialData?.usesPesticide ?? false,
      pesticide_types: initialData?.pesticideTypes ?? '',
      uses_herbicide: initialData?.usesHerbicide ?? false,
      herbicide_types: initialData?.herbicideTypes ?? '',
      fertilizer_types: initialData?.fertilizerTypes ?? '',
      water_source: initialData?.waterSource ?? '',
      land_history: initialData?.landHistory ?? '',
      photo_farm: initialData?.photoFarm ?? null,
      active: initialData?.active ?? true
    }
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const handleAddressChange = (updates: Partial<AddressFormState>) => {
    const numericKeys = ['country_id', 'state_id', 'city_id', 'district_id', 'subdistrict_id', 'latitude', 'longitude'] as const

    numericKeys.forEach((key) => {
      if (key in updates) {
        const value = updates[key]
        form.setValue(key, typeof value === 'number' ? value : undefined, { shouldValidate: true, shouldDirty: true })
      }
    })

    if ('address_detail' in updates) {
      form.setValue('address_detail', updates.address_detail ?? '', { shouldValidate: true, shouldDirty: true })
    }
  }

  const addressValues: AddressFormState = {
    country_id: form.watch('country_id'),
    state_id: form.watch('state_id'),
    city_id: form.watch('city_id'),
    district_id: form.watch('district_id'),
    subdistrict_id: form.watch('subdistrict_id'),
    address_detail: form.watch('address_detail'),
    latitude: form.watch('latitude'),
    longitude: form.watch('longitude')
  }

  const onSubmit = form.handleSubmit(async (values: FarmFormValues) => {
    const result = isEdit && initialData ? await updateMutation.mutateAsync({ id: initialData.id, values }) : await createMutation.mutateAsync(values)

    if (result.success) {
      toast.success(isEdit ? t('toast.updateSuccess') : t('toast.createSuccess'))
      router.push('/scm/farms')
      return
    }

    if (result.error === 'DUPLICATE_CODE') {
      toast.error(t('toast.duplicateCode'))
      return
    }

    toast.error(result.error || t('toast.saveError'))
  })

  const labels: Record<FarmSectionId, string> = {
    identity: t('form.tabs.identity'),
    terroir: t('form.tabs.terroir'),
    cultivation: t('form.tabs.cultivation'),
    sustainability: t('form.tabs.sustainability')
  }
  const tabs = SECTION_IDS.map((id) => ({ id, label: labels[id] }))

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <PageHeader
          title={isEdit ? t('form.editTitle') : t('form.createTitle')}
          description={t('form.description')}
          showBack
          backHref="/scm/farms"
          actions={
            <LoadingButton type="submit" isLoading={isPending} className="cursor-pointer gap-1.5">
              <Save className="h-3.5 w-3.5" />
              <span>{t('form.buttons.save')}</span>
            </LoadingButton>
          }
        />

        <PillTabs
          items={tabs}
          value={activeSection}
          onValueChange={setActiveSection}
          tabListId="farm-sections"
          ariaLabel={t('form.tabs.label')}
          disabled={isPending}
          itemClassName="min-w-36"
        />
        <div
          id={`farm-sections-panel-${activeSection}`}
          role="tabpanel"
          aria-labelledby={`farm-sections-tab-${activeSection}`}
          className="space-y-4 sm:space-y-6"
        >
          {activeSection === 'identity' && (
            <IdentitySection form={form} partnerOptions={partnerOptions} commodityOptions={commodityOptions} disabled={isPending} />
          )}
          {activeSection === 'terroir' && (
            <>
              <AddressSection
                values={addressValues}
                onChange={handleAddressChange}
                errors={form.formState.errors as Record<string, { message?: string }>}
                disabled={isPending}
              />
              <TerroirSection form={form} disabled={isPending} />
            </>
          )}
          {activeSection === 'cultivation' && <CultivationSection form={form} disabled={isPending} />}
          {activeSection === 'sustainability' && (
            <>
              <SustainabilitySection form={form} disabled={isPending} />
              {initialData ? (
                <MediaSection model="syailendra.farm" recordId={initialData.id} role="gallery" aspectRatio={4 / 3} disabled={isPending} />
              ) : null}
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
