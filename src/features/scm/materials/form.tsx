/**
 * form.tsx — Action dialog form for Material Master
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSaveMaterialMutation } from '@/hooks/scm/use-materials'
import { getMaterialFormSchema } from '@/schemas/scm/material-schema'

import { getMaterialOptions } from './options'
import { MaterialQcSection } from './qc-section'

import type { MaterialFormValues } from '@/schemas/scm/material-schema'
import type { MaterialRecord } from '@/types/scm/material'
import type { ReactElement } from 'react'

export interface MaterialFormProps {
  currentRow: MaterialRecord | null
  onSuccess: () => void
}

export function MaterialForm({ currentRow, onSuccess }: MaterialFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('scm.materials')
  const { mutateAsync: saveMaterial } = useSaveMaterialMutation()

  const { categoryOptions, methodOptions, aromaOptions, trackingOptions, uomOptions } = useMemo(() => getMaterialOptions(t), [t])

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(getMaterialFormSchema(t)),
    defaultValues: {
      id: currentRow?.id,
      default_code: currentRow?.default_code || '',
      name: currentRow?.name || '',
      commercial_name: currentRow?.commercial_name || '',
      category: currentRow?.category || 'essential_oils',
      botanical_name: currentRow?.botanical_name || '',
      family: currentRow?.family || '',
      inci_name: currentRow?.inci_name || '',
      plant_part: currentRow?.plant_part || '',
      extraction_method: currentRow?.extraction_method || 'steam_distillation',
      aroma_note: currentRow?.aroma_note || 'base',
      shelf_life_months: currentRow?.shelf_life_months || 60,
      uom_id: currentRow?.uom_id ? currentRow.uom_id[0] : 1,
      tracking: currentRow?.tracking || 'lot',
      cas_number: currentRow?.cas_number || '',
      einecs_number: currentRow?.einecs_number || '',
      fema_number: currentRow?.fema_number || '',
      hs_code: currentRow?.hs_code || '3301.29.90',
      relative_density_20c: currentRow?.qc_specs?.relative_density_20c || '',
      refractive_index_20c: currentRow?.qc_specs?.refractive_index_20c || '',
      optical_rotation_20c: currentRow?.qc_specs?.optical_rotation_20c || '',
      flash_point_c: currentRow?.qc_specs?.flash_point_c || undefined,
      ethanol_solubility: currentRow?.qc_specs?.ethanol_solubility || '',
      key_compounds: currentRow?.qc_specs?.key_compounds || '',
      max_moisture_pct: currentRow?.qc_specs?.max_moisture_pct || undefined,
      min_yield_pct: currentRow?.qc_specs?.min_yield_pct || undefined,
      description: currentRow?.description || ''
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = form

  useEffect(() => {
    if (currentRow) {
      reset({
        id: currentRow.id,
        default_code: currentRow.default_code,
        name: currentRow.name,
        commercial_name: currentRow.commercial_name || '',
        category: currentRow.category,
        botanical_name: currentRow.botanical_name || '',
        family: currentRow.family || '',
        inci_name: currentRow.inci_name || '',
        plant_part: currentRow.plant_part || '',
        extraction_method: currentRow.extraction_method,
        aroma_note: currentRow.aroma_note || 'base',
        shelf_life_months: currentRow.shelf_life_months,
        uom_id: currentRow.uom_id ? currentRow.uom_id[0] : 1,
        tracking: currentRow.tracking,
        cas_number: currentRow.cas_number || '',
        einecs_number: currentRow.einecs_number || '',
        fema_number: currentRow.fema_number || '',
        hs_code: currentRow.hs_code || '3301.29.90',
        relative_density_20c: currentRow.qc_specs?.relative_density_20c || '',
        refractive_index_20c: currentRow.qc_specs?.refractive_index_20c || '',
        optical_rotation_20c: currentRow.qc_specs?.optical_rotation_20c || '',
        flash_point_c: currentRow.qc_specs?.flash_point_c || undefined,
        ethanol_solubility: currentRow.qc_specs?.ethanol_solubility || '',
        key_compounds: currentRow.qc_specs?.key_compounds || '',
        max_moisture_pct: currentRow.qc_specs?.max_moisture_pct || undefined,
        min_yield_pct: currentRow.qc_specs?.min_yield_pct || undefined,
        description: currentRow.description || ''
      })
    }
  }, [currentRow, reset])

  const onSubmit = async (values: MaterialFormValues) => {
    try {
      const res = await saveMaterial(values)
      if (res.success) {
        toast.success(isEdit ? t('toasts.updatedSuccess', { name: values.name }) : t('toasts.createdSuccess', { name: values.name }))
        onSuccess()
      } else {
        toast.error(res.error || t('toasts.errorOccurred'))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.errorOccurred'))
    }
  }

  return (
    <form id="material-action-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Tabs defaultValue="commercial" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="commercial" className="text-xs">
            {t('sections.commercialAndBotanical')}
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs">
            {t('sections.exportCompliance')}
          </TabsTrigger>
          <TabsTrigger value="qc" className="text-xs">
            {t('sections.qcStandards')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commercial" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <FormFieldWrapper label={t('fields.defaultCode')} error={errors.default_code?.message} required className="sm:col-span-2">
              <Input {...register('default_code')} placeholder={t('fields.defaultCodePlaceholder')} className="font-mono text-xs uppercase" />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.name')} error={errors.name?.message} required className="sm:col-span-4">
              <Input {...register('name')} placeholder={t('fields.namePlaceholder')} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.commercialName')} error={errors.commercial_name?.message} className="sm:col-span-3">
              <Input {...register('commercial_name')} placeholder={t('fields.commercialNamePlaceholder')} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.category')} error={errors.category?.message} required className="sm:col-span-3">
              <SelectForm
                value={watch('category')}
                onValueChange={(val) => setValue('category', val as MaterialFormValues['category'])}
                items={categoryOptions}
                placeholder={t('fields.categoryPlaceholder')}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.botanicalName')} error={errors.botanical_name?.message} className="sm:col-span-3">
              <Input {...register('botanical_name')} placeholder={t('fields.botanicalNamePlaceholder')} className="italic" />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.family')} error={errors.family?.message} className="sm:col-span-3">
              <Input {...register('family')} placeholder={t('fields.familyPlaceholder')} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.inciName')} error={errors.inci_name?.message} className="sm:col-span-3">
              <Input {...register('inci_name')} placeholder={t('fields.inciNamePlaceholder')} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.plantPart')} error={errors.plant_part?.message} className="sm:col-span-3">
              <Input {...register('plant_part')} placeholder={t('fields.plantPartPlaceholder')} />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.extractionMethod')} error={errors.extraction_method?.message} required className="sm:col-span-3">
              <SelectForm
                value={watch('extraction_method')}
                onValueChange={(val) => setValue('extraction_method', val as MaterialFormValues['extraction_method'])}
                items={methodOptions}
                placeholder={t('fields.extractionMethodPlaceholder')}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.aromaNote')} error={errors.aroma_note?.message} className="sm:col-span-3">
              <SelectForm
                value={watch('aroma_note') || 'base'}
                onValueChange={(val) => setValue('aroma_note', val as MaterialFormValues['aroma_note'])}
                items={aromaOptions}
                placeholder={t('fields.aromaNotePlaceholder')}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.uom')} error={errors.uom_id?.message} required className="sm:col-span-3">
              <SelectForm
                value={String(watch('uom_id') || 1)}
                onValueChange={(val) => setValue('uom_id', Number(val))}
                items={uomOptions}
                placeholder={t('fields.uomPlaceholder')}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.tracking')} error={errors.tracking?.message} required className="sm:col-span-3">
              <SelectForm
                value={watch('tracking')}
                onValueChange={(val) => setValue('tracking', val as MaterialFormValues['tracking'])}
                items={trackingOptions}
                placeholder={t('fields.trackingPlaceholder')}
              />
            </FormFieldWrapper>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <FormFieldWrapper label={t('fields.casNumber')} error={errors.cas_number?.message} className="sm:col-span-3">
              <Input {...register('cas_number')} placeholder={t('fields.casNumberPlaceholder')} className="font-mono text-xs" />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.einecsNumber')} error={errors.einecs_number?.message} className="sm:col-span-3">
              <Input {...register('einecs_number')} placeholder={t('fields.einecsNumberPlaceholder')} className="font-mono text-xs" />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.femaNumber')} error={errors.fema_number?.message} className="sm:col-span-3">
              <Input {...register('fema_number')} placeholder={t('fields.femaNumberPlaceholder')} className="font-mono text-xs" />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.hsCode')} error={errors.hs_code?.message} required className="sm:col-span-3">
              <Input {...register('hs_code')} placeholder={t('fields.hsCodePlaceholder')} className="font-mono text-xs" />
            </FormFieldWrapper>

            <FormFieldWrapper label={t('fields.shelfLifeMonths')} error={errors.shelf_life_months?.message} required className="sm:col-span-6">
              <Input
                type="number"
                {...register('shelf_life_months', { valueAsNumber: true })}
                placeholder={t('fields.shelfLifeMonthsPlaceholder')}
                className="font-mono"
              />
            </FormFieldWrapper>
          </div>
        </TabsContent>

        <TabsContent value="qc" className="space-y-4">
          <MaterialQcSection register={register} errors={errors} t={t} />
        </TabsContent>
      </Tabs>
    </form>
  )
}
