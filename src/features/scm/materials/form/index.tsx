/**
 * index.tsx — Dedicated form page component for Material Master
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSaveMaterialMutation } from '@/hooks/scm/use-materials'
import { Link, useRouter } from '@/i18n/navigation'
import { getMaterialFormSchema } from '@/schemas/scm/material-schema'

import { getMaterialOptions } from './options'
import { MaterialQcSection } from './qc-section'

import type { MaterialFormValues } from '@/schemas/scm/material-schema'
import type { MaterialRecord } from '@/types/scm/material'
import type { ReactElement } from 'react'

export interface MaterialFormProps {
  initialData?: MaterialRecord | null
}

export function MaterialForm({ initialData }: MaterialFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const t = useTranslations('scm.materials')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveMaterial, isPending } = useSaveMaterialMutation()

  const { categoryOptions, methodOptions, aromaOptions, trackingOptions, uomOptions } = useMemo(() => getMaterialOptions(t), [t])

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(getMaterialFormSchema(t)),
    defaultValues: {
      id: initialData?.id,
      default_code: initialData?.default_code || '',
      name: initialData?.name || '',
      commercial_name: initialData?.commercial_name || '',
      category: initialData?.category || 'essential_oils',
      botanical_name: initialData?.botanical_name || '',
      family: initialData?.family || '',
      inci_name: initialData?.inci_name || '',
      plant_part: initialData?.plant_part || '',
      extraction_method: initialData?.extraction_method || 'steam_distillation',
      aroma_note: initialData?.aroma_note || 'base',
      shelf_life_months: initialData?.shelf_life_months || 60,
      uom_id: initialData?.uom_id ? initialData.uom_id[0] : 1,
      tracking: initialData?.tracking || 'lot',
      cas_number: initialData?.cas_number || '',
      einecs_number: initialData?.einecs_number || '',
      fema_number: initialData?.fema_number || '',
      hs_code: initialData?.hs_code || '3301.29.90',
      relative_density_20c: initialData?.qc_specs?.relative_density_20c || '',
      refractive_index_20c: initialData?.qc_specs?.refractive_index_20c || '',
      optical_rotation_20c: initialData?.qc_specs?.optical_rotation_20c || '',
      flash_point_c: initialData?.qc_specs?.flash_point_c || undefined,
      ethanol_solubility: initialData?.qc_specs?.ethanol_solubility || '',
      key_compounds: initialData?.qc_specs?.key_compounds || '',
      max_moisture_pct: initialData?.qc_specs?.max_moisture_pct || undefined,
      min_yield_pct: initialData?.qc_specs?.min_yield_pct || undefined,
      description: initialData?.description || ''
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
    if (initialData) {
      reset({
        id: initialData.id,
        default_code: initialData.default_code,
        name: initialData.name,
        commercial_name: initialData.commercial_name || '',
        category: initialData.category,
        botanical_name: initialData.botanical_name || '',
        family: initialData.family || '',
        inci_name: initialData.inci_name || '',
        plant_part: initialData.plant_part || '',
        extraction_method: initialData.extraction_method,
        aroma_note: initialData.aroma_note || 'base',
        shelf_life_months: initialData.shelf_life_months,
        uom_id: initialData.uom_id ? initialData.uom_id[0] : 1,
        tracking: initialData.tracking,
        cas_number: initialData.cas_number || '',
        einecs_number: initialData.einecs_number || '',
        fema_number: initialData.fema_number || '',
        hs_code: initialData.hs_code || '3301.29.90',
        relative_density_20c: initialData.qc_specs?.relative_density_20c || '',
        refractive_index_20c: initialData.qc_specs?.refractive_index_20c || '',
        optical_rotation_20c: initialData.qc_specs?.optical_rotation_20c || '',
        flash_point_c: initialData.qc_specs?.flash_point_c || undefined,
        ethanol_solubility: initialData.qc_specs?.ethanol_solubility || '',
        key_compounds: initialData.qc_specs?.key_compounds || '',
        max_moisture_pct: initialData.qc_specs?.max_moisture_pct || undefined,
        min_yield_pct: initialData.qc_specs?.min_yield_pct || undefined,
        description: initialData.description || ''
      })
    }
  }, [initialData, reset])

  const onSubmit = async (values: MaterialFormValues) => {
    try {
      const res = await saveMaterial(values)
      if (res.success) {
        toast.success(isEdit ? t('toasts.updatedSuccess', { name: values.name }) : t('toasts.createdSuccess', { name: values.name }))
        router.push('/scm/materials')
        router.refresh()
      } else {
        toast.error(res.error || t('toasts.errorOccurred'))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.errorOccurred'))
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/scm/materials" className="gap-2">
                <ArrowLeft className="size-4" />
                <span>{tCommon('actions.cancel')}</span>
              </Link>
            </Button>
            <Button form="material-page-form" type="submit" disabled={isPending} className="gap-2 font-semibold">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>{tCommon('actions.save')}</span>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form id="material-page-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <TabsContent value="commercial" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
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

              <TabsContent value="export" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
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

              <TabsContent value="qc" className="space-y-4 pt-2">
                <MaterialQcSection register={register} errors={errors} t={t} />
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
