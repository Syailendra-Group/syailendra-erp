'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/scm/use-suppliers'
import { getSupplierFormSchema } from '@/schemas/scm/supplier-schema'

import { AddressSection } from './address-section'
import { ContactTaxSection } from './contact-tax-section'
import { FinanceSection } from './finance-section'
import { IdentitySection } from './identity-section'

import type { SupplierFormValues, SupplierRecord } from '@/types/scm/supplier'

interface SupplierFormProps {
  initialData?: SupplierRecord | null
  isEdit?: boolean
}

export function SupplierForm({ initialData, isEdit = false }: SupplierFormProps) {
  const router = useRouter()
  const t = useTranslations('scm.suppliers')
  const tCommon = useTranslations('common')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()

  const defaultValues: SupplierFormValues = {
    ref: initialData?.ref || '',
    name: initialData?.name || '',
    isCompany: initialData?.isCompany ?? true,
    companyType: initialData?.companyType || 'company',
    categoryIds: initialData?.categoryIds || [],
    contactName: initialData?.contactName || '',
    phone: initialData?.phone || '',
    mobile: initialData?.mobile || '',
    email: initialData?.email || '',
    vat: initialData?.vat || '',
    countryId: initialData?.countryId || null,
    stateId: initialData?.stateId || null,
    street: initialData?.street || '',
    zip: initialData?.zip || '',
    paymentTerm: initialData?.paymentTerm || 'COD',
    bankName: initialData?.bankInfo?.bankName || '',
    accountNumber: initialData?.bankInfo?.accountNumber || '',
    accountHolder: initialData?.bankInfo?.accountHolder || '',
    legacyCode: initialData?.legacyCode || '',
    active: initialData?.active ?? true
  }

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(getSupplierFormSchema(t)),
    defaultValues
  })

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      setIsSubmitting(true)
      if (isEdit && initialData) {
        const res = await updateMutation.mutateAsync({ id: initialData.id, values })
        if (res.success) {
          toast.success(t('toast.updateSuccess'))
          router.push('/scm/suppliers')
        } else {
          toast.error(res.error || t('toast.createError'))
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
        <PageHeader
          showBack
          backHref="/scm/suppliers"
          title={isEdit ? t('form.editTitle') : t('form.createTitle')}
          description={isEdit ? t('form.editDescription') : t('form.createDescription')}
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" className="h-8 cursor-pointer text-xs" onClick={() => router.push('/scm/suppliers')}>
                {t('form.buttons.cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 cursor-pointer gap-1.5 text-xs font-medium">
                <Save className="h-3.5 w-3.5" />
                <span>{isSubmitting ? tCommon('status.saving') : t('form.buttons.save')}</span>
              </Button>
            </div>
          }
        />

        {/* 4 Semantic Form Sections (< 200 lines per section) */}
        <div className="space-y-6">
          <IdentitySection form={form} />
          <ContactTaxSection form={form} />
          <AddressSection form={form} />
          <FinanceSection form={form} />
        </div>
      </form>
    </Form>
  )
}
