'use client'

import { useMemo, useState } from 'react'
import { Info, Loader2, RotateCcw, Save, Sliders } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_PILLAR_OWNERS, PILLAR_ORDER } from '@/data/pillar-catalog'
import { useCompaniesQuery, useSavePillarAllocationMutation } from '@/hooks/others/use-companies'
import { useEntityStore } from '@/stores/entity-store'

import { MenuSummaryCards } from './summary-cards'
import { MenuAllocationTable } from './table'

import type { ModuleTab } from '@/stores/nav-store'
import type { PillarAllocationEntry } from '@/types/others/company'
import type { ReactElement } from 'react'

export function MenuAllocationFeature(): ReactElement {
  const t = useTranslations('others.menus')
  const syncEntitiesFromOdoo = useEntityStore((s) => s.syncEntitiesFromOdoo)

  const { data, isLoading } = useCompaniesQuery()
  const saveAllocationMutation = useSavePillarAllocationMutation()

  const companies = useMemo(() => data?.companies || [], [data])

  // Server-derived ownership (no effect needed); user edits are kept as local overrides
  const serverOwnerMap = useMemo<Record<ModuleTab, number>>(() => {
    const nextMap: Record<ModuleTab, number> = { ...DEFAULT_PILLAR_OWNERS }
    companies.forEach((c) => c.enabled_pillars.forEach((pillar) => (nextMap[pillar] = c.id)))
    return nextMap
  }, [companies])

  const [overrides, setOverrides] = useState<Partial<Record<ModuleTab, number>>>({})

  const ownerMap = useMemo<Record<ModuleTab, number>>(() => ({ ...serverOwnerMap, ...overrides }), [serverOwnerMap, overrides])

  const isDirty = PILLAR_ORDER.some((p) => ownerMap[p] !== serverOwnerMap[p])

  const handleAssignOwner = (pillar: ModuleTab, companyId: number) => {
    setOverrides((prev) => ({ ...prev, [pillar]: companyId }))
  }

  const handleResetDefault = () => {
    setOverrides({ ...DEFAULT_PILLAR_OWNERS })
  }

  const handleSave = () => {
    const entries: PillarAllocationEntry[] = companies.map((c) => ({
      companyId: c.id,
      pillars: PILLAR_ORDER.filter((p) => ownerMap[p] === c.id)
    }))

    const emptyEntity = entries.find((e) => e.pillars.length === 0)
    if (emptyEntity) {
      const comp = companies.find((c) => c.id === emptyEntity.companyId)
      toast.error(t('emptyEntityError', { code: comp?.short_name || `PT-${emptyEntity.companyId}` }))
      return
    }

    saveAllocationMutation.mutate(entries, {
      onSuccess: (res) => {
        if (res.success) {
          syncEntitiesFromOdoo(
            companies.map((c) => ({
              id: c.id,
              name: c.name,
              short_name: c.short_name,
              logo_web: c.logo_web,
              enabled_pillars: entries.find((e) => e.companyId === c.id)?.pillars || []
            }))
          )
          setOverrides({})
          toast.success(t('saveSuccess'))
        } else {
          toast.error(t('saveError', { error: res.error || t('unknownError') }))
        }
      },
      onError: (err) => {
        toast.error(t('saveError', { error: err instanceof Error ? err.message : String(err) }))
      }
    })
  }

  if (isLoading && companies.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Sliders}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleResetDefault} className="gap-1.5 text-xs">
              <RotateCcw className="size-3.5" />
              <span>{t('resetDefault')}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isDirty || saveAllocationMutation.isPending}
              onClick={handleSave}
              className="gap-1.5 font-semibold"
            >
              {saveAllocationMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>{t('saveButton')}</span>
            </Button>
          </div>
        }
      />

      <Alert className="border-primary/30 bg-primary/5">
        <Info className="text-primary size-4" />
        <AlertTitle className="text-xs font-semibold sm:text-sm">{t('exclusivityTitle')}</AlertTitle>
        <AlertDescription className="text-muted-foreground text-xs">{t('exclusivityDesc')}</AlertDescription>
      </Alert>

      <MenuSummaryCards companies={companies} ownerMap={ownerMap} />

      <MenuAllocationTable companies={companies} ownerMap={ownerMap} onAssign={handleAssignOwner} />
    </div>
  )
}
