'use client'

import * as React from 'react'
import { Boxes, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LanguageToggle } from '@/components/shared/language-toggle'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage(): React.ReactElement {
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tInventory = useTranslations('inventory')

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-2xl space-y-6">
        {/* Top bar controls */}
        <div className="bg-card flex items-center justify-between rounded-xl border p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="border-primary/20 bg-primary/10 text-primary dark:text-primary rounded-lg border p-2">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg leading-tight font-bold">ERP Syailendra Group</h1>
              <p className="text-muted-foreground text-xs">Next.js 16 • next-themes • next-intl</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Feature status card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="text-primary h-4 w-4" />
                {tNav('tabs.inventory')} & i18n Status
              </CardTitle>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary dark:text-primary">
                Active
              </Badge>
            </div>
            <CardDescription>{tInventory('kpi.on_hand')} • Default Light Mode & Bahasa Indonesia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/40 rounded-lg border p-3">
                <span className="text-muted-foreground block text-xs">{tInventory('kpi.ready_transfers')}</span>
                <span className="text-primary dark:text-primary text-xl font-bold">12 Batch</span>
              </div>
              <div className="bg-muted/40 rounded-lg border p-3">
                <span className="text-muted-foreground block text-xs">{tInventory('kpi.waiting_operations')}</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">3 PO</span>
              </div>
            </div>

            <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
              <span className="text-primary dark:text-primary flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {tCommon('status.success')}
              </span>
              <Button className="cursor-pointer">{tCommon('actions.view')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
