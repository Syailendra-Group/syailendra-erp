'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { RegionalMapField } from '@/components/map/regional-map-field'
import { Form, FormField, FormItem } from '@/components/ui/form'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCountriesQuery } from '@/hooks/others/use-countries'
import { useCheckProvinceExistsQuery, useSaveProvinceMutation } from '@/hooks/others/use-provinces'
import { useCatalogProvincesQuery } from '@/hooks/shared/use-regional-catalog'
import { getProvinceFormSchema } from '@/schemas/others/province-schema'
import { getProvinceCentroid, getProvincePrefix } from '@/utils/regional-helper'

import { DomesticProvinceSection } from './domestic-section'
import { ForeignProvinceSection } from './foreign-section'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { MapCoordinates } from '@/types/components/map'
import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export interface ProvinceFormProps {
  currentRow: ProvinceRecord | null
  onSuccess: () => void
}

function getInitialValues(row: ProvinceRecord | null): ProvinceFormValues {
  return {
    id: row?.id,
    is_domestic: row?.country_id ? row.country_id[0] === 100 : true,
    name: row?.name || '',
    code: row?.code || '',
    prefix: (row?.prefix as string) || (row?.name ? getProvincePrefix(row.name) : ''),
    alias: (row?.alias as string) || '',
    description: (row?.description as string) || '',
    country_id: row?.country_id ? row.country_id[0] : 100,
    latitude: typeof row?.latitude === 'number' ? row.latitude : undefined,
    longitude: typeof row?.longitude === 'number' ? row.longitude : undefined
  }
}

export function ProvinceForm({ currentRow, onSuccess }: ProvinceFormProps): ReactElement {
  const isEdit = !!currentRow
  const t = useTranslations('others.provinces')
  const tReg = useTranslations('regional.common')
  const tToast = useTranslations('regional.regionalToasts')
  const { mutateAsync: saveProvince, isPending } = useSaveProvinceMutation()
  const { data: countries = [] } = useCountriesQuery()
  const { data: catalogProvinces = [], isLoading: isLoadingCatalog } = useCatalogProvincesQuery()
  const [activeCentroid, setActiveCentroid] = useState<MapCoordinates | null>(null)

  const countryOptions = useMemo(() => countries.map((c) => ({ label: c.name, value: String(c.id) })), [countries])

  const form = useForm<ProvinceFormValues>({
    resolver: zodResolver(getProvinceFormSchema(t)),
    defaultValues: getInitialValues(currentRow)
  })

  useEffect(() => {
    form.reset(getInitialValues(currentRow))
  }, [currentRow, form])

  const isDomestic = form.watch('is_domestic')
  const currentCode = form.watch('code')
  const currentName = form.watch('name')
  const lat = form.watch('latitude')
  const lng = form.watch('longitude')

  const { data: provinceExists } = useCheckProvinceExistsQuery(
    { code: currentCode, name: currentName },
    isDomestic && Boolean(currentCode) && !isEdit
  )
  const isDuplicate = isDomestic && !isEdit && Boolean(provinceExists?.exists)

  const handleSelectDomestic = (provCode: string) => {
    const found = catalogProvinces.find((p) => p.code === provCode)
    if (found) {
      form.setValue('name', found.name, { shouldValidate: true })
      form.setValue('code', found.code, { shouldValidate: true })
      form.setValue('prefix', getProvincePrefix(found.name), { shouldValidate: true })
      form.setValue('alias', found.name, { shouldValidate: true })

      const centroid = getProvinceCentroid(found.name)
      if (centroid) {
        form.setValue('latitude', centroid.latitude, { shouldValidate: true, shouldDirty: true })
        form.setValue('longitude', centroid.longitude, { shouldValidate: true, shouldDirty: true })
        setActiveCentroid({ ...centroid, zoom: 8 })
      }
    }
  }

  const onSubmit = async (values: ProvinceFormValues) => {
    if (isDuplicate) {
      toast.error(tToast('alreadyExists', { entity: tReg('entities.province') }))
      return
    }
    try {
      const res = await saveProvince(values)
      if (res.success) {
        toast.success(
          isEdit ? tToast('updateSuccess', { entity: tReg('entities.province') }) : tToast('createSuccess', { entity: tReg('entities.province') })
        )
        onSuccess()
        form.reset()
      } else {
        toast.error(res.error || tToast('saveFailed', { entity: tReg('entities.province') }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tToast('genericError'))
    }
  }

  const catalogItems = useMemo(() => catalogProvinces.map((p) => ({ label: `${p.name} (${p.code})`, value: p.code })), [catalogProvinces])

  return (
    <Form {...form}>
      <form id="province-action-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
        <div className="border-border/60 flex items-center justify-between border-b pb-1">
          <span className="text-foreground text-xs font-semibold">{t('form.category')}</span>
          <Tabs
            value={isDomestic ? 'domestic' : 'foreign'}
            onValueChange={(val) => {
              const dom = val === 'domestic'
              form.setValue('is_domestic', dom)
              form.setValue('country_id', dom ? 100 : Number(countryOptions.find((c) => c.value !== '100')?.value || 100))
            }}
          >
            <TabsList className="h-7 text-xs">
              <TabsTrigger value="domestic" className="px-2.5 text-xs">
                {tReg('domesticCatalog')}
              </TabsTrigger>
              <TabsTrigger value="foreign" className="px-2.5 text-xs">
                {tReg('foreignManual')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* Left Column: Administrative Details (stacked 1-per-line) */}
          <div className="space-y-3.5">
            {isDomestic ? (
              <DomesticProvinceSection
                form={form}
                isPending={isPending}
                isLoadingCatalog={isLoadingCatalog}
                currentCode={currentCode}
                currentName={currentName}
                catalogItems={catalogItems}
                isDuplicate={isDuplicate}
                duplicateId={provinceExists?.id}
                onSelectDomestic={handleSelectDomestic}
                t={t}
                tReg={tReg}
                tToast={tToast}
              />
            ) : (
              <ForeignProvinceSection form={form} isPending={isPending} countryOptions={countryOptions} t={t} tReg={tReg} />
            )}

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormFieldWrapper id="prov-desc" label={tReg('fields.description')} error={form.formState.errors.description?.message}>
                    <Textarea id="prov-desc" rows={2} placeholder={tReg('placeholders.defaultNotes')} disabled={isPending} {...field} />
                  </FormFieldWrapper>
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Interactive MapPicker */}
          <div className="border-border/60 bg-muted/10 rounded-lg border p-3">
            <RegionalMapField
              latitude={lat}
              longitude={lng}
              centroidPan={activeCentroid}
              disabled={isPending}
              onLocationChange={({ latitude, longitude }) => {
                form.setValue('latitude', latitude, { shouldValidate: true, shouldDirty: true })
                form.setValue('longitude', longitude, { shouldValidate: true, shouldDirty: true })
              }}
            />
          </div>
        </div>
      </form>
    </Form>
  )
}
