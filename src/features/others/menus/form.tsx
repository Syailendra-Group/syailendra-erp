'use client'

import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { SelectForm } from '@/components/form/select-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCompaniesQuery } from '@/hooks/others/use-companies'
import { useSavePillarMutation } from '@/hooks/others/use-menus'
import { createPillarSchema } from '@/schemas/others/menu-schema'

import type { PillarFormValues } from '@/schemas/others/menu-schema'
import type { SelectOption } from '@/types/components/select'
import type { PillarRecord } from '@/types/others/menu'
import type { ReactElement } from 'react'

export interface PillarFormProps {
  currentRow: PillarRecord | null
  onSuccess: () => void
}

export function PillarForm({ currentRow, onSuccess }: PillarFormProps): ReactElement {
  const t = useTranslations('others.menus')
  const { data: companiesData } = useCompaniesQuery()
  const { mutateAsync: savePillar } = useSavePillarMutation()

  const schema = useMemo(
    () =>
      createPillarSchema((key, values) => {
        try {
          return t(key, values)
        } catch {
          return key
        }
      }),
    [t]
  )

  const form = useForm<PillarFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: currentRow?.id || 1,
      short_name: currentRow?.short_name || '',
      name: currentRow?.name || '',
      tagline: currentRow?.tagline || '',
      description: currentRow?.description || '',
      company_id: currentRow?.company_id || 1,
      sequence: currentRow?.sequence || 10
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = form

  const companyItems: SelectOption<string>[] = useMemo(
    () =>
      (companiesData?.companies || []).map((c) => ({
        value: String(c.id),
        label: `${c.short_name} - ${c.name}`
      })),
    [companiesData]
  )

  const selectedCompanyId = String(watch('company_id'))

  const onSubmit = async (values: PillarFormValues) => {
    try {
      const res = await savePillar(values)
      if (res.success) {
        toast.success(t('saveSuccess'))
        onSuccess()
      } else {
        toast.error(res.error || t('saveError'))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <form id="pillar-action-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FormFieldWrapper id="pillar-short-name" label={t('form.shortName')} required error={errors.short_name?.message} className="sm:col-span-1">
          <Input id="pillar-short-name" placeholder={t('form.shortNamePlaceholder')} maxLength={30} {...register('short_name')} />
        </FormFieldWrapper>

        <FormFieldWrapper id="pillar-name" label={t('form.name')} required error={errors.name?.message} className="sm:col-span-2">
          <Input id="pillar-name" placeholder={t('form.namePlaceholder')} maxLength={120} {...register('name')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper id="pillar-tagline" label={t('form.tagline')} error={errors.tagline?.message}>
        <Input id="pillar-tagline" placeholder={t('form.taglinePlaceholder')} maxLength={200} {...register('tagline')} />
      </FormFieldWrapper>

      <FormFieldWrapper id="pillar-company" label={t('form.ownerCompany')} required error={errors.company_id?.message}>
        <SelectForm<string>
          items={companyItems}
          value={selectedCompanyId}
          onValueChange={(val) => setValue('company_id', Number(val), { shouldValidate: true })}
          placeholder={t('form.selectCompany')}
          addNewAction={false}
        />
      </FormFieldWrapper>

      <FormFieldWrapper id="pillar-sequence" label={t('form.sequence')} error={errors.sequence?.message}>
        <Input id="pillar-sequence" type="number" min={1} max={999} {...register('sequence', { valueAsNumber: true })} />
      </FormFieldWrapper>

      <FormFieldWrapper id="pillar-description" label={t('form.description')} error={errors.description?.message}>
        <Textarea
          id="pillar-description"
          placeholder={t('form.descriptionPlaceholder')}
          rows={3}
          className="resize-none text-xs"
          {...register('description')}
        />
      </FormFieldWrapper>
    </form>
  )
}
