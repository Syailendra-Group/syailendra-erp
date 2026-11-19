/**
 * esg-section.tsx — Supplier sustainability and social compliance (document section K)
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { Leaf } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useWatch } from 'react-hook-form'

import { SectionCard } from '@/components/card/section-card'
import { NumberField } from '@/components/form/number-field'
import { SwitchField } from '@/components/form/switch-field'
import { TextareaField } from '@/components/form/textarea-field'

import type { SupplierSectionProps } from '@/types/scm/supplier-form'

export function EsgSection({ form, disabled = false }: SupplierSectionProps) {
  const t = useTranslations('scm.suppliers')
  const noChildLabor = useWatch({ control: form.control, name: 'noChildLabor' })
  const fairWage = useWatch({ control: form.control, name: 'fairWage' })
  const renewableEnergy = useWatch({ control: form.control, name: 'renewableEnergy' })

  return (
    <SectionCard title={t('form.sections.esg')} description={t('form.sections.esgDesc')} icon={Leaf} contentClassName="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField control={form.control} name="farmerCount" label={t('form.fields.farmerCount')} min={0} step="1" disabled={disabled} />
        <NumberField control={form.control} name="workerCount" label={t('form.fields.workerCount')} min={0} step="1" disabled={disabled} />
        <NumberField
          control={form.control}
          name="femaleWorkerPct"
          label={t('form.fields.femaleWorkerPct')}
          min={0}
          max={100}
          step="0.01"
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SwitchField
          id="noChildLabor"
          ariaLabel={t('form.fields.noChildLabor')}
          variant="card"
          label={t('form.fields.noChildLabor')}
          checked={noChildLabor}
          disabled={disabled}
          onCheckedChange={(checked) => form.setValue('noChildLabor', checked, { shouldDirty: true })}
        />
        <SwitchField
          id="fairWage"
          ariaLabel={t('form.fields.fairWage')}
          variant="card"
          label={t('form.fields.fairWage')}
          checked={fairWage}
          disabled={disabled}
          onCheckedChange={(checked) => form.setValue('fairWage', checked, { shouldDirty: true })}
        />
        <SwitchField
          id="renewableEnergy"
          ariaLabel={t('form.fields.renewableEnergy')}
          variant="card"
          label={t('form.fields.renewableEnergy')}
          checked={renewableEnergy}
          disabled={disabled}
          onCheckedChange={(checked) => form.setValue('renewableEnergy', checked, { shouldDirty: true })}
        />
      </div>

      <TextareaField
        control={form.control}
        name="wasteManagement"
        label={t('form.fields.wasteManagement')}
        placeholder={t('form.fields.wasteManagementPlaceholder')}
        rows={3}
        disabled={disabled}
      />
    </SectionCard>
  )
}
