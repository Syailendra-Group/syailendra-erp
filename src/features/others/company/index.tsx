'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, Save, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { PillTabs } from '@/components/button/pill-tabs'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { useCompaniesQuery, useSaveCompanyMutation } from '@/hooks/others/use-companies'
import { createCompanySchema } from '@/schemas/others/company-schema'
import { useEntityStore } from '@/stores/entity-store'

import { CommsSection } from './form/comms-section'
import { IdentitySection } from './form/identity-section'
import { PillarsSection } from './form/pillars-section'
import { CompanySkeleton } from './skeleton'

import type { PillTabItem } from '@/components/button/pill-tabs'
import type { CompanyFormValues } from '@/schemas/others/company-schema'
import type { ReactElement } from 'react'

export function CompanyFeature(): ReactElement {
  const t = useTranslations('others.company')
  const updateEntityIdentity = useEntityStore((s) => s.updateEntityIdentity)
  const updateEntityPillars = useEntityStore((s) => s.updateEntityPillars)

  const [selectedId, setSelectedId] = useState<number>(4)

  const { data, isLoading } = useCompaniesQuery()
  const saveMutation = useSaveCompanyMutation()

  const companies = useMemo(() => data?.companies || [], [data])

  const selectedCompany = useMemo(() => companies.find((c) => c.id === selectedId) || companies[0], [companies, selectedId])

  const tabItems: PillTabItem<number>[] = useMemo(
    () =>
      companies.map((c) => ({
        id: c.id,
        label: c.short_name,
        sublabel: c.name,
        imageSrc: c.logo_web,
        fallbackText: c.short_name
      })),
    [companies]
  )

  const schema = useMemo(
    () =>
      createCompanySchema((key, values) => {
        try {
          return t(key, values)
        } catch {
          return key
        }
      }),
    [t]
  )

  const odooFormValues: CompanyFormValues | undefined = useMemo(
    () =>
      selectedCompany
        ? {
            id: selectedCompany.id,
            short_name: selectedCompany.short_name,
            name: selectedCompany.name,
            tagline: selectedCompany.tagline,
            email: selectedCompany.email,
            phone: selectedCompany.phone,
            mobile: selectedCompany.mobile,
            website: selectedCompany.website,
            street: selectedCompany.street,
            city: selectedCompany.city,
            zip: selectedCompany.zip,
            vat: selectedCompany.vat,
            logo_web: selectedCompany.logo_web,
            enabled_pillars: selectedCompany.enabled_pillars
          }
        : undefined,
    [selectedCompany]
  )

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    values: odooFormValues
  })

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(
      {
        id: values.id,
        short_name: values.short_name,
        name: values.name,
        tagline: values.tagline,
        email: values.email,
        phone: values.phone,
        mobile: values.mobile,
        website: values.website,
        street: values.street,
        city: values.city,
        zip: values.zip,
        vat: values.vat,
        logo_web: values.logo_web,
        enabled_pillars: values.enabled_pillars
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            updateEntityIdentity(values.id, {
              name: values.name,
              code: values.short_name,
              logoBase64: values.logo_web ?? null
            })
            updateEntityPillars(values.id, values.enabled_pillars)
            toast.success(t('saveSuccess', { code: values.short_name }))
          } else {
            toast.error(t('saveError', { error: res.error || t('unknownError') }))
          }
        },
        onError: (err) => {
          toast.error(t('saveError', { error: err instanceof Error ? err.message : String(err) }))
        }
      }
    )
  })

  if (isLoading || !selectedCompany) {
    return <CompanySkeleton />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Building}
        actions={
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 text-[11px] sm:text-xs">
            <Sparkles className="mr-1 size-3 sm:size-3.5" />
            {t('badge')}
          </Badge>
        }
      />

      {/* Full-width Responsive PillTabs with Company Logo */}
      <PillTabs items={tabItems} value={selectedCompany.id} onValueChange={setSelectedId} />

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <IdentitySection form={form} t={t} />
          <CommsSection form={form} t={t} />
        </div>

        <PillarsSection form={form} t={t} />

        <div className="flex items-center justify-end border-t pt-4">
          <LoadingButton type="submit" isLoading={saveMutation.isPending} icon={Save}>
            <span>{t('saveButton')}</span>
          </LoadingButton>
        </div>
      </form>
    </div>
  )
}
