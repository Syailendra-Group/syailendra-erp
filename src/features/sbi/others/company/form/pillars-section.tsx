'use client'

import { Bot, Calculator, Clock, Layers, LayoutDashboard, Leaf, Sliders, Store, Target, Warehouse } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import type { CompanyFormValues } from '@/schemas/sbi/others/company-schema'
import type { ModuleTab } from '@/stores/nav-store'
import type { ElementType, ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface PillarsSectionProps {
  form: UseFormReturn<CompanyFormValues>
  t: (key: string) => string
}

const ALL_PILLARS: { id: ModuleTab; icon: ElementType }[] = [
  { id: 'main', icon: LayoutDashboard },
  { id: 'ftm', icon: Calculator },
  { id: 'hrm', icon: Clock },
  { id: 'scm', icon: Layers },
  { id: 'wms', icon: Warehouse },
  { id: 'crm', icon: Target },
  { id: 'dcm', icon: Store },
  { id: 'ai', icon: Bot },
  { id: 'imm', icon: Leaf },
  { id: 'others', icon: Sliders }
]

export function PillarsSection({ form, t }: PillarsSectionProps): ReactElement {
  const enabledPillars = form.watch('enabled_pillars') || []
  const errorMsg = form.formState.errors.enabled_pillars?.message

  const handleToggle = (pillarId: ModuleTab, checked: boolean) => {
    const next = checked ? Array.from(new Set([...enabledPillars, pillarId])) : enabledPillars.filter((p) => p !== pillarId)

    form.setValue('enabled_pillars', next, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">{t('sections.pillars.title')}</CardTitle>
        <CardDescription className="text-xs">{t('sections.pillars.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {errorMsg && <p className="text-destructive text-xs font-medium">{errorMsg}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {ALL_PILLARS.map(({ id, icon: Icon }) => {
            const isChecked = enabledPillars.includes(id)
            return (
              <div
                key={id}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors',
                  isChecked ? 'border-primary/40 bg-primary/5' : 'bg-card border-border/60'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border',
                      isChecked ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs leading-tight font-semibold">{t(`pillarLabels.${id}`)}</div>
                    <p className="text-muted-foreground text-[11px] leading-snug">{t(`pillarDesc.${id}`)}</p>
                  </div>
                </div>
                <Switch checked={isChecked} onCheckedChange={(val) => handleToggle(id, val)} aria-label={t(`pillarLabels.${id}`)} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
