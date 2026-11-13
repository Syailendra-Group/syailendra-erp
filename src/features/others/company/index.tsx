'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, Loader2, Save, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompaniesQuery, useSaveCompanyMutation } from '@/hooks/others/use-companies'
import { createCompanySchema } from '@/schemas/others/company-schema'
import { useEntityStore } from '@/stores/entity-store'

import { CommsSection } from './form/comms-section'
import { IdentitySection } from './form/identity-section'
import { LogoUploadSection } from './form/logo-upload-section'
import { PillarsSection } from './form/pillars-section'

import type { CompanyFormValues } from '@/schemas/others/company-schema'
import type { ReactElement } from 'react'

export function CompanyFeature(): ReactElement {
  const t = useTranslations('others.company')
  const updateEntityIdentity = useEntityStore((s) => s.updateEntityIdentity)
  const updateEntityPillars = useEntityStore((s) => s.updateEntityPillars)

  const [selectedId, setSelectedId] = useState<number>(1)

  const { data, isLoading } = useCompaniesQuery()
  const saveMutation = useSaveCompanyMutation()

  const companies = useMemo(() => data?.companies || [], [data])

  const selectedCompany = useMemo(() => companies.find((c) => c.id === selectedId) || companies[0], [companies, selectedId])

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

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: 1,
      short_name: 'PT SBI',
      name: '',
      tagline: '',
      email: '',
      phone: '',
      mobile: '',
      website: '',
      street: '',
      city: '',
      zip: '',
      vat: '',
      logo_web: null,
      enabled_pillars: ['ftm', 'hrm', 'scm']
    }
  })

  useEffect(() => {
    if (selectedCompany) {
      form.reset({
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
      })
    }
  }, [selectedCompany, form])

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

  if (isLoading && companies.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    )
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

      {/* Entity Switcher Tabs */}
      <div className="bg-muted/40 flex flex-wrap gap-2 rounded-xl border p-2">
        {companies.map((c) => {
          const isActive = c.id === selectedCompany?.id
          return (
            <Button
              key={c.id}
              type="button"
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedId(c.id)}
              className="gap-2 font-semibold"
            >
              <span>{c.short_name}</span>
              <span className="hidden text-xs font-normal opacity-80 md:inline">• {c.name}</span>
            </Button>
          )
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6">
            <IdentitySection form={form} t={t} />
            <LogoUploadSection form={form} t={t} />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <CommsSection form={form} t={t} />
          </div>
        </div>

        <PillarsSection form={form} t={t} />

        <div className="flex items-center justify-end border-t pt-4">
          <Button type="submit" disabled={saveMutation.isPending} className="gap-2 font-semibold">
            {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{t('saveButton')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
