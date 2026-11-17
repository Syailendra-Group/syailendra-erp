'use client'

/**
 * index.tsx — Distillation Facility form orchestrator (ActionDialog modal)
 * Syailendra Group ERP — SCM Pillar
 */
import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useDistilleryPartnerOptions, useSaveDistilleryMutation } from '@/hooks/scm/use-distilleries'
import { getDistilleryFormSchema } from '@/schemas/scm/distillery-schema'

import { IdentitySection } from './identity-section'
import { LocationSection } from './location-section'
import { PerformanceSection } from './performance-section'
import { SpecSection } from './spec-section'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { DistilleryRecord } from '@/types/scm/distillery'
import type { ReactElement } from 'react'

export interface DistilleryFormProps {
  currentRow?: DistilleryRecord | null
  onSuccess: () => void
  onPendingChange?: (isPending: boolean) => void
}

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

export function DistilleryForm({ currentRow, onSuccess, onPendingChange }: DistilleryFormProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const { mutateAsync: saveDistillery, isPending } = useSaveDistilleryMutation()
  const { data: partnerOptions = [] } = useDistilleryPartnerOptions()
  const isEdit = Boolean(currentRow)

  const formValues = useMemo(() => toDistilleryFormValues(currentRow), [currentRow])

  const form = useForm<DistilleryFormValues>({
    resolver: zodResolver(getDistilleryFormSchema(t)),
    values: formValues
  })

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  const onSubmit = async (values: DistilleryFormValues) => {
    const payload = isEdit && currentRow ? { ...values, id: currentRow.id } : values

    try {
      const res = await saveDistillery(payload)
      if (res.success) {
        toast.success(isEdit ? t('messages.updated') : t('messages.created'))
        onSuccess()
        return
      }
      toast.error(res.error === 'DUPLICATE_CODE' ? t('messages.duplicateCode') : res.error || t('messages.error'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('messages.error'))
    }
  }

  return (
    <form id="distillery-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <IdentitySection form={form} partnerOptions={partnerOptions} disabled={isPending} />
      <SpecSection form={form} disabled={isPending} />
      <PerformanceSection form={form} disabled={isPending} />
      <LocationSection form={form} disabled={isPending} />
    </form>
  )
}
