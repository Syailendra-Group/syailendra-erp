/**
 * index.tsx — Distillation Facility page form with document-aligned pill sections
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useDeferredValue, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { PillTabs } from '@/components/button/pill-tabs'
import { MediaSection } from '@/components/image/media-section'
import { InfoAlert } from '@/components/shared/info-alert'
import { PageHeader } from '@/components/shared/page-header'
import { Form } from '@/components/ui/form'
import { useDistilleryPartnerOptions, useSaveDistilleryMutation } from '@/hooks/scm/use-distilleries'
import { useRouter } from '@/i18n/navigation'
import { getDistilleryFormSchema } from '@/schemas/scm/distillery-schema'

import { IdentitySection } from './identity-section'
import { LocationSection } from './location-section'
import { PerformanceSection } from './performance-section'
import { SpecSection } from './spec-section'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { DistilleryRecord } from '@/types/scm/distillery'
import type { ReactElement } from 'react'

export interface DistilleryFormProps {
  initialData?: DistilleryRecord | null
}

const SECTION_IDS = ['identity', 'location', 'spec', 'performance', 'assets'] as const
type DistillerySectionId = (typeof SECTION_IDS)[number]

function toDistilleryFormValues(record?: DistilleryRecord | null): DistilleryFormValues {
  if (!record) {
    return {
      name: '',
      code: '',
      partner_id: 0,
      state_id: undefined,
      city_id: undefined,
      district_id: undefined,
      subdistrict_id: undefined,
      address_detail: '',
      latitude: undefined,
      longitude: undefined,
      facility_area_m2: undefined,
      distillation_method: 'steam',
      boiler_count: 1,
      boiler_capacity_kg: 0,
      boiler_material: 'stainless_304',
      fuel_type: 'biomass',
      avg_duration_hours: undefined,
      operating_temp_c: undefined,
      operating_pressure_bar: undefined,
      avg_yield_percent: undefined,
      monthly_capacity_kg: undefined,
      yearly_capacity_kg: undefined,
      max_capacity_kg: undefined,
      lead_time_days: undefined,
      moq_kg: undefined,
      photo_distillery: null,
      active: true
    }
  }

  return {
    id: record.id,
    name: record.name,
    code: record.code,
    partner_id: record.partnerId ?? 0,
    state_id: record.stateId ?? undefined,
    city_id: record.cityId ?? undefined,
    district_id: record.districtId ?? undefined,
    subdistrict_id: record.subdistrictId ?? undefined,
    address_detail: record.addressDetail || '',
    latitude: record.latitude ?? undefined,
    longitude: record.longitude ?? undefined,
    facility_area_m2: record.facilityAreaM2 ?? undefined,
    distillation_method: record.distillationMethod,
    boiler_count: record.boilerCount || 1,
    boiler_capacity_kg: record.boilerCapacityKg ?? 0,
    boiler_material: record.boilerMaterial,
    fuel_type: record.fuelType,
    avg_duration_hours: record.avgDurationHours ?? undefined,
    operating_temp_c: record.operatingTempC ?? undefined,
    operating_pressure_bar: record.operatingPressureBar ?? undefined,
    avg_yield_percent: record.avgYieldPercent ?? undefined,
    monthly_capacity_kg: record.monthlyCapacityKg ?? undefined,
    yearly_capacity_kg: record.yearlyCapacityKg ?? undefined,
    max_capacity_kg: record.maxCapacityKg ?? undefined,
    lead_time_days: record.leadTimeDays ?? undefined,
    moq_kg: record.moqKg ?? undefined,
    photo_distillery: record.photoDistillery ?? null,
    active: record.active
  }
}

export function DistilleryForm({ initialData }: DistilleryFormProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { mutateAsync: saveDistillery, isPending } = useSaveDistilleryMutation()
  const [partnerSearch, setPartnerSearch] = useState('')
  const deferredPartnerSearch = useDeferredValue(partnerSearch)
  const { data: partnerOptions = [] } = useDistilleryPartnerOptions(deferredPartnerSearch)
  const isEdit = Boolean(initialData)
  const [activeSection, setActiveSection] = useState<DistillerySectionId>('identity')

  const form = useForm<DistilleryFormValues>({
    resolver: zodResolver(getDistilleryFormSchema(t)),
    defaultValues: toDistilleryFormValues(initialData)
  })

  const onSubmit = form.handleSubmit(async (values: DistilleryFormValues) => {
    const payload = isEdit && initialData ? { ...values, id: initialData.id } : values

    try {
      const res = await saveDistillery(payload)
      if (res.success) {
        toast.success(isEdit ? t('messages.updated') : t('messages.created'))
        router.push('/scm/distilleries')
        return
      }
      toast.error(res.error === 'DUPLICATE_CODE' ? t('messages.duplicateCode') : res.error || tCommon('messages.error'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon('messages.error'))
    }
  })

  const labels: Record<DistillerySectionId, string> = {
    identity: t('sections.identity'),
    location: t('sections.location'),
    spec: t('sections.spec'),
    performance: t('sections.performance'),
    assets: t('sections.assets')
  }
  const tabs = SECTION_IDS.map((id) => ({ id, label: labels[id] }))

  return (
    <Form {...form}>
      <form id="distillery-page-form" onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <PageHeader
          title={isEdit ? t('actions.editTitle') : t('actions.createTitle')}
          description={isEdit ? t('actions.editDesc') : t('actions.createDesc')}
          showBack
          backHref="/scm/distilleries"
          actions={
            <LoadingButton type="submit" isLoading={isPending} loadingText={tCommon('status.saving')} icon={Save} className="cursor-pointer gap-1.5">
              <span>{tCommon('actions.save')}</span>
            </LoadingButton>
          }
        />

        <PillTabs
          items={tabs}
          value={activeSection}
          onValueChange={setActiveSection}
          tabListId="distillery-sections"
          ariaLabel={t('sections.label')}
          disabled={isPending}
          itemClassName="min-w-36"
        />
        <div
          id={`distillery-sections-panel-${activeSection}`}
          role="tabpanel"
          aria-labelledby={`distillery-sections-tab-${activeSection}`}
          className="space-y-4 sm:space-y-6"
        >
          {activeSection === 'identity' && (
            <IdentitySection form={form} partnerOptions={partnerOptions} onPartnerSearch={setPartnerSearch} disabled={isPending} />
          )}
          {activeSection === 'location' && <LocationSection form={form} disabled={isPending} />}
          {activeSection === 'assets' &&
            (initialData ? (
              <MediaSection
                model="syailendra.distillery"
                recordId={initialData.id}
                role="facility"
                aspectRatio={4 / 3}
                disabled={isPending}
                legacyImageUrl={`/api/odoo/image/syailendra.distillery/${initialData.id}/photo_distillery?size=512`}
              />
            ) : (
              <InfoAlert variant="info" title={t('sections.assetsPendingTitle')} description={t('sections.assetsPendingDescription')} />
            ))}
          {activeSection === 'spec' && <SpecSection form={form} disabled={isPending} />}
          {activeSection === 'performance' && <PerformanceSection form={form} disabled={isPending} />}
        </div>
      </form>
    </Form>
  )
}
