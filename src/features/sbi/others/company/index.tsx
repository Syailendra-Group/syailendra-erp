'use client'

import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building, Loader2, Save, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getCompaniesAction, saveCompanyAction } from '@/actions/sbi/others/company.action'
import { TurnstileField } from '@/components/form/turnstile-field'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createCompanySchema } from '@/schemas/sbi/others/company-schema'
import { useEntityStore } from '@/stores/entity-store'

import { CommsSection } from './form/comms-section'
import { IdentitySection } from './form/identity-section'
import { LogoUploadSection } from './form/logo-upload-section'
import { PillarsSection } from './form/pillars-section'

import type { CompanyFormValues } from '@/schemas/sbi/others/company-schema'
import type { ReactElement } from 'react'

export function CompanyFeature(): ReactElement {
  const t = useTranslations('others.company')
  const tSchema = useTranslations('common')
  const queryClient = useQueryClient()
  const syncEntitiesFromOdoo = useEntityStore((s) => s.syncEntitiesFromOdoo)
  const updateEntityPillars = useEntityStore((s) => s.updateEntityPillars)
  const updateEntityLogo = useEntityStore((s) => s.updateEntityLogo)

  const [selectedId, setSelectedId] = useState<number>(1)

  const { data, isLoading } = useQuery({
    queryKey: ['companies-list'],
    queryFn: () => getCompaniesAction()
  })

  const companies = useMemo(() => data?.companies || [], [data])

  useEffect(() => {
    if (companies.length > 0) {
      syncEntitiesFromOdoo(
        companies.map((c) => ({
          id: c.id,
          name: c.name,
          logo_web: c.logo_web,
          enabled_pillars: c.enabled_pillars
        }))
      )
    }
  }, [companies, syncEntitiesFromOdoo])

  const selectedCompany = useMemo(() => companies.find((c) => c.id === selectedId) || companies[0], [companies, selectedId])

  const schema = useMemo(
    () =>
      createCompanySchema((key, values) => {
        try {
          return tSchema(key, values)
        } catch {
          return key
        }
      }),
    [tSchema]
  )

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: 1,
      name: '',
      tagline: '',
      email: '',
      phone: '',
      website: '',
      street: '',
      city: '',
      zip: '',
      vat: '',
      logo_web: null,
      enabled_pillars: ['main', 'ftm', 'hrm', 'scm', 'others'],
      turnstileToken: ''
    }
  })

  useEffect(() => {
    if (selectedCompany) {
      form.reset({
        id: selectedCompany.id,
        name: selectedCompany.name,
        tagline: selectedCompany.tagline,
        email: selectedCompany.email,
        phone: selectedCompany.phone,
        website: selectedCompany.website,
        street: selectedCompany.street,
        city: selectedCompany.city,
        zip: selectedCompany.zip,
        vat: selectedCompany.vat,
        logo_web: selectedCompany.logo_web,
        enabled_pillars: selectedCompany.enabled_pillars,
        turnstileToken: ''
      })
    }
  }, [selectedCompany, form])

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) =>
      saveCompanyAction({
        id: values.id,
        name: values.name,
        tagline: values.tagline,
        email: values.email,
        phone: values.phone,
        website: values.website,
        street: values.street,
        city: values.city,
        zip: values.zip,
        vat: values.vat,
        logo_web: values.logo_web,
        enabled_pillars: values.enabled_pillars
      }),
    onSuccess: (res, variables) => {
      if (res.success) {
        updateEntityPillars(variables.id, variables.enabled_pillars)
        if (variables.logo_web !== undefined) {
          updateEntityLogo(variables.id, variables.logo_web || null)
        }
        queryClient.invalidateQueries({ queryKey: ['companies-list'] })
        toast.success(t('saveSuccess', { code: selectedCompany?.code || `PT-${variables.id}` }))
      } else {
        toast.error(t('saveError', { error: res.error || 'Unknown error' }))
      }
    },
    onError: (err) => {
      toast.error(t('saveError', { error: err instanceof Error ? err.message : String(err) }))
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values)
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
              <span>{c.code}</span>
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

        <div className="flex flex-col items-end justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
          <TurnstileField control={form.control} action="update_company" />

          <Button type="submit" disabled={mutation.isPending} className="gap-2 font-semibold">
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{t('saveButton')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
