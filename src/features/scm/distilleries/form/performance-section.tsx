'use client'

import { Gauge } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'

import { DistilleryNumberField } from './number-field'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface PerformanceSectionProps {
  form: UseFormReturn<DistilleryFormValues>
  disabled: boolean
}

export function PerformanceSection({ form, disabled }: PerformanceSectionProps): ReactElement {
  const t = useTranslations('scm.distilleries')
  const {
    control,
    formState: { errors }
  } = form

  return (
    <SectionCard title={t('sections.performance')} description={t('sections.performanceDesc')} icon={Gauge} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <DistilleryNumberField
          control={control}
          name="avg_duration_hours"
          label={t('fields.avgDuration')}
          placeholder={t('fields.avgDurationPlaceholder')}
          error={errors.avg_duration_hours?.message}
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="operating_temp_c"
          label={t('fields.operatingTemp')}
          placeholder={t('fields.operatingTempPlaceholder')}
          error={errors.operating_temp_c?.message}
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="operating_pressure_bar"
          label={t('fields.operatingPressure')}
          placeholder={t('fields.operatingPressurePlaceholder')}
          error={errors.operating_pressure_bar?.message}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <DistilleryNumberField
          control={control}
          name="avg_yield_percent"
          label={t('fields.avgYield')}
          placeholder={t('fields.avgYieldPlaceholder')}
          error={errors.avg_yield_percent?.message}
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="monthly_capacity_kg"
          label={t('fields.monthlyCapacity')}
          placeholder={t('fields.monthlyCapacityPlaceholder')}
          error={errors.monthly_capacity_kg?.message}
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="yearly_capacity_kg"
          label={t('fields.yearlyCapacity')}
          placeholder={t('fields.yearlyCapacityPlaceholder')}
          error={errors.yearly_capacity_kg?.message}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <DistilleryNumberField
          control={control}
          name="max_capacity_kg"
          label={t('fields.maxCapacity')}
          placeholder={t('fields.maxCapacityPlaceholder')}
          error={errors.max_capacity_kg?.message}
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="lead_time_days"
          label={t('fields.leadTime')}
          placeholder={t('fields.leadTimePlaceholder')}
          error={errors.lead_time_days?.message}
          step="1"
          disabled={disabled}
        />
        <DistilleryNumberField
          control={control}
          name="moq_kg"
          label={t('fields.moq')}
          placeholder={t('fields.moqPlaceholder')}
          error={errors.moq_kg?.message}
          disabled={disabled}
        />
      </div>
    </SectionCard>
  )
}
