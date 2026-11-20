/**
 * index.tsx — Dedicated form page orchestrator for Product Master
 * Syailendra Group ERP — SCM Pillar
 */

'use client'

import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { ImageDropzone } from '@/components/image/image-dropzone'
import { MediaSection } from '@/components/image/media-section'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSaveProductMutation } from '@/hooks/scm/use-products'
import { useRouter } from '@/i18n/navigation'
import { getProductFormSchema } from '@/schemas/scm/product-schema'

import { ProductCommercialSection } from './commercial-section'
import { ProductExportSection } from './export-section'
import { getProductOptions } from './options'
import { ProductQcSection } from './qc-section'

import type { ProductFormValues } from '@/schemas/scm/product-schema'
import type { ProductRecord } from '@/types/scm/product'
import type { ReactElement } from 'react'

function toProductFormValues(record?: ProductRecord | null): ProductFormValues | undefined {
  if (!record) {
    return undefined
  }
  return {
    id: record.id,
    default_code: record.default_code,
    name: record.name,
    commercial_name: record.commercial_name ?? '',
    category: record.category,
    botanical_name: record.botanical_name ?? '',
    family: record.family ?? '',
    inci_name: record.inci_name ?? '',
    plant_part: record.plant_part ?? '',
    extraction_method: record.extraction_method,
    aroma_note: record.aroma_note,
    shelf_life_months: record.shelf_life_months,
    uom_id: record.uom_id ? record.uom_id[0] : 1,
    tracking: record.tracking,
    cas_number: record.cas_number ?? '',
    einecs_number: record.einecs_number ?? '',
    fema_number: record.fema_number ?? '',
    hs_code: record.hs_code,
    relative_density_20c: record.qc_specs?.relative_density_20c ?? '',
    refractive_index_20c: record.qc_specs?.refractive_index_20c ?? '',
    optical_rotation_20c: record.qc_specs?.optical_rotation_20c ?? '',
    flash_point_c: record.qc_specs?.flash_point_c,
    ethanol_solubility: record.qc_specs?.ethanol_solubility ?? '',
    key_compounds: record.qc_specs?.key_compounds ?? '',
    max_moisture_pct: record.qc_specs?.max_moisture_pct,
    min_yield_pct: record.qc_specs?.min_yield_pct,
    description: record.description ?? '',
    image_1920: null,
    profileImageUrl: record.imageUrl ?? null
  }
}

export interface ProductFormProps {
  initialData?: ProductRecord | null
}

export function ProductForm({ initialData }: ProductFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const t = useTranslations('scm.products')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveProduct, isPending } = useSaveProductMutation()

  const { categoryOptions, methodOptions, aromaOptions, trackingOptions, uomOptions } = useMemo(() => getProductOptions(t), [t])

  const values = useMemo<ProductFormValues | undefined>(() => toProductFormValues(initialData), [initialData])

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(getProductFormSchema(t)),
    values
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = form

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const res = await saveProduct(values)
      if (res.success) {
        toast.success(isEdit ? t('toasts.updatedSuccess', { name: values.name }) : t('toasts.createdSuccess', { name: values.name }))
        router.push('/scm/products')
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
        showBack
        backHref="/scm/products"
        title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" className="cursor-pointer text-xs" onClick={() => router.push('/scm/products')}>
              {tCommon('actions.cancel')}
            </Button>
            <LoadingButton
              form="product-page-form"
              type="submit"
              isLoading={isPending}
              loadingText={tCommon('actions.loading')}
              icon={Save}
              className="text-xs"
            >
              <span>{tCommon('actions.save')}</span>
            </LoadingButton>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <form id="product-page-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <FormFieldWrapper id="image_1920" label={t('fields.primaryPhoto')} error={errors.image_1920?.message}>
                  <ImageDropzone
                    value={watch('image_1920') ?? watch('profileImageUrl') ?? null}
                    onChange={(value) => setValue('image_1920', typeof value === 'string' ? value : null, { shouldDirty: true })}
                    valueMode="base64"
                    aspectRatio={1}
                    maxImageSize={5}
                    disabled={isPending}
                  />
                </FormFieldWrapper>
                {isEdit && initialData ? (
                  <MediaSection model="product.template" recordId={initialData.id} role="product" aspectRatio={1} disabled={isPending} />
                ) : null}
                <ProductCommercialSection
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  categoryOptions={categoryOptions}
                  methodOptions={methodOptions}
                  aromaOptions={aromaOptions}
                  uomOptions={uomOptions}
                  trackingOptions={trackingOptions}
                  t={t}
                />
              </TabsContent>

              <TabsContent value="export" className="space-y-4 pt-4">
                <ProductExportSection register={register} errors={errors} t={t} />
              </TabsContent>

              <TabsContent value="qc" className="space-y-4 pt-2">
                <ProductQcSection register={register} errors={errors} t={t} />
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
