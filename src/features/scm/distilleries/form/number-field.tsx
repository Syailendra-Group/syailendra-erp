'use client'

import { Controller } from 'react-hook-form'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'

import type { DistilleryFormValues } from '@/schemas/scm/distillery-schema'
import type { ReactElement } from 'react'
import type { Control } from 'react-hook-form'

export type DistilleryNumericField =
  | 'facility_area_m2'
  | 'boiler_count'
  | 'boiler_capacity_kg'
  | 'avg_duration_hours'
  | 'operating_temp_c'
  | 'operating_pressure_bar'
  | 'avg_yield_percent'
  | 'monthly_capacity_kg'
  | 'yearly_capacity_kg'
  | 'max_capacity_kg'
  | 'lead_time_days'
  | 'moq_kg'
  | 'latitude'
  | 'longitude'

export interface DistilleryNumberFieldProps {
  control: Control<DistilleryFormValues>
  name: DistilleryNumericField
  label: string
  placeholder?: string
  error?: string
  step?: string
  min?: number
  required?: boolean
  disabled?: boolean
}

export function DistilleryNumberField({
  control,
  name,
  label,
  placeholder,
  error,
  step = '0.01',
  min = 0,
  required = false,
  disabled = false
}: DistilleryNumberFieldProps): ReactElement {
  return (
    <FormFieldWrapper id={name} label={label} required={required} error={error}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={name}
            type="number"
            step={step}
            min={min}
            placeholder={placeholder}
            className="font-mono text-xs"
            disabled={disabled}
            value={typeof field.value === 'number' ? field.value : ''}
            onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
          />
        )}
      />
    </FormFieldWrapper>
  )
}
