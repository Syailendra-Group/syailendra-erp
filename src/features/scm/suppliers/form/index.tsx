/**
 * index.tsx — Supplier create/edit form composed of document-aligned sections
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { PillTabs } from '@/components/button/pill-tabs'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/scm/use-suppliers'
import { useRouter } from '@/i18n/navigation'
import { getSupplierFormSchema } from '@/schemas/scm/supplier-schema'

import { ContactLegalSection } from './contact-legal-section'
import { EsgSection } from './esg-section'
import { FinanceSection } from './finance-section'
import { IdentitySection } from './identity-section'
import { addressFieldIds, fieldSections, getSectionErrors, sectionIds } from './sections'
import { SummarySection } from './summary-section'
import { SupplierAddress } from './supplier-address'

import type { SupplierFormValues } from '@/types/scm/supplier'
import type { SupplierFormProps, SupplierSectionId } from '@/types/scm/supplier-form'
import type { FieldErrors } from 'react-hook-form'

export function SupplierForm({ initialData, isEdit = false }: SupplierFormProps) {
  const router = useRouter()
  const t = useTranslations('scm.suppliers')
  const tCommon = useTranslations('common')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState<SupplierSectionId>('identity')

  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()

  const values: SupplierFormValues = {
    ref: initialData?.ref || '',
    name: initialData?.name || '',
    isCompany: initialData?.isCompany ?? true,
    companyType: initialData?.companyType || 'company',
    categoryIds: initialData?.categoryIds || [],
    supplierTypeId: initialData?.supplierTypeId ?? null,
    supplierTypeVerified: initialData ? !initialData.needsReview : false,
    needsReview: initialData?.needsReview ?? false,
    image_1920: null,
    profileImageUrl: initialData?.imageUrl ?? null,
    ownerName: initialData?.ownerName || '',
    picName: initialData?.picName || '',
    picPosition: initialData?.picPosition || '',
    joinYear: initialData?.joinYear ?? undefined,
    nib: initialData?.nib || '',
    businessLicense: initialData?.businessLicense || '',
    phone: initialData?.phone || '',
    mobile: initialData?.mobile || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    vat: initialData?.vat || '',
    nik: initialData?.nik || '',
    countryId: initialData?.countryId ?? null,
    stateId: initialData?.stateId ?? null,
    cityId: initialData?.cityId ?? null,
    districtId: initialData?.districtId ?? null,
    subDistrictId: initialData?.subDistrictId ?? null,
    street: initialData?.street || '',
    addressDetail: initialData?.addressDetail ?? '',
    addressBenchmark: initialData?.addressBenchmark ?? '',
    zip: initialData?.zip || '',
    latitude: initialData?.latitude ?? undefined,
    longitude: initialData?.longitude ?? undefined,
    farmerCount: initialData?.farmerCount ?? undefined,
    workerCount: initialData?.workerCount ?? undefined,
    femaleWorkerPct: initialData?.femaleWorkerPct ?? undefined,
    noChildLabor: initialData?.noChildLabor ?? true,
    fairWage: initialData?.fairWage ?? true,
    wasteManagement: initialData?.wasteManagement || '',
    renewableEnergy: initialData?.renewableEnergy ?? false,
    paymentTerm: initialData?.paymentTerm || 'COD',
    bankName: initialData?.bankInfo?.bankName || '',
    accountNumber: initialData?.bankInfo?.accountNumber || '',
    accountHolder: initialData?.bankInfo?.accountHolder || '',
    legacyCode: initialData?.legacyCode || '',
    active: initialData?.active ?? true
  }

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(getSupplierFormSchema(t)),
    values,
    shouldUnregister: false,
    shouldFocusError: false,
    resetOptions: { keepDirtyValues: true, keepErrors: true }
  })

  const isPending = isSubmitting || createMutation.isPending || updateMutation.isPending

  const { errors, dirtyFields } = form.formState
  void dirtyFields // Subscribe so keepDirtyValues protects edits during a query refresh.
  const { counts } = getSectionErrors(errors)
  const onInvalid = (validationErrors: FieldErrors<SupplierFormValues>) => {
    const { first } = getSectionErrors(validationErrors)
    if (!first) return
    setActiveSection(fieldSections[first])
    // The target section mounts on the next commit; focus its first invalid input afterwards.
    requestAnimationFrame(() => {
      const addressId = first in addressFieldIds ? addressFieldIds[first as keyof typeof addressFieldIds] : first
      const input = document.getElementById(addressId)
      if (input) input.focus()
      else form.setFocus(first)
    })
  }
  const labels = {
    identity: t('form.tabs.identity'),
    contact: t('form.tabs.contact'),
    location: t('form.tabs.location'),
    finance: t('form.tabs.finance'),
    esg: t('form.tabs.esg')
  }
  const tabs = sectionIds.map((id) => ({
    id,
    label: labels[id],
    badge: counts[id] ? (
      <Badge variant="destructive" aria-label={t('form.tabs.errors', { count: counts[id] })}>
        {counts[id]}
      </Badge>
    ) : undefined
  }))

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      setIsSubmitting(true)
      if (isEdit && initialData) {
        const res = await updateMutation.mutateAsync({ id: initialData.id, values })
        if (res.success) {
          toast.success(t('toast.updateSuccess'))
          router.push('/scm/suppliers')
        } else {
          toast.error(res.error || t('toast.updateError'))
        }
      } else {
        const res = await createMutation.mutateAsync(values)
        if (res.success) {
          toast.success(t('toast.createSuccess'))
          router.push('/scm/suppliers')
        } else {
          toast.error(res.error || t('toast.createError'))
        }
      }
    } catch {
      toast.error(t('toast.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 pb-12">
        <PageHeader
          showBack
          backHref="/scm/suppliers"
          title={isEdit ? t('form.editTitle') : t('form.createTitle')}
          description={isEdit ? t('form.editDescription') : t('form.createDescription')}
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" className="cursor-pointer text-xs" onClick={() => router.push('/scm/suppliers')}>
                {t('form.buttons.cancel')}
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isPending}
                loadingText={tCommon('status.saving')}
                icon={Save}
                className="cursor-pointer gap-1.5"
              >
                <span>{t('form.buttons.save')}</span>
              </LoadingButton>
            </div>
          }
        />

        <PillTabs
          items={tabs}
          value={activeSection}
          onValueChange={setActiveSection}
          tabListId="supplier-sections"
          ariaLabel={t('form.tabs.label')}
          disabled={isPending}
          itemClassName="min-w-36"
        />
        <div id={`supplier-sections-panel-${activeSection}`} role="tabpanel" aria-labelledby={`supplier-sections-tab-${activeSection}`}>
          {activeSection === 'identity' && (
            <IdentitySection form={form} digitalCode={initialData?.digitalCode} recordId={initialData?.id} isEdit={isEdit} disabled={isPending} />
          )}
          {activeSection === 'contact' && <ContactLegalSection form={form} disabled={isPending} />}
          {activeSection === 'location' && <SupplierAddress form={form} disabled={isPending} />}
          {activeSection === 'finance' && <FinanceSection form={form} disabled={isPending} />}
          {activeSection === 'esg' && (
            <div className="flex flex-col gap-6">
              <EsgSection form={form} disabled={isPending} />
              {isEdit && initialData ? <SummarySection record={initialData} /> : null}
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}
