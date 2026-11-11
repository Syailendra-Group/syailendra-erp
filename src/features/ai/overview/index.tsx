'use client'

import { type ReactElement } from 'react'
import { BarChart3, BookOpen, Bot, MessageSquareCode, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SummaryCardGrid } from '@/components/card/summary-card'
import { QuickActions } from '@/components/shared/quick-actions'
import { Badge } from '@/components/ui/badge'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { QuickActionItem } from '@/components/shared/quick-actions'

export function AiOverview(): ReactElement {
  const t = useTranslations('ai.overview')
  const tCommon = useTranslations('common')

  const kpis: SummaryCardItem[] = [
    { title: 'Hotline AI Aktif', value: '24/7 Siaga', subtitle: 'Natural Voice & Text Engine', icon: Bot, color: 'text-primary' },
    { title: 'Sesi Percakapan', value: '320 Obrolan', subtitle: 'Pertanyaan Produk & Pesanan', icon: MessageSquareCode, color: 'text-blue-500' },
    { title: 'Resolusi Otomatis', value: '92.4%', subtitle: 'Tanpa Intervensi CS Manual', icon: Zap, color: 'text-emerald-500' },
    { title: 'Skor Kepuasan CSAT', value: '4.9 / 5.0', subtitle: 'Feedback Pelanggan DDistillers', icon: BarChart3, color: 'text-amber-500' }
  ]

  const shortcuts: QuickActionItem[] = [
    { label: 'Log Sesi Hotline Nona Atsirich', href: '/ai', icon: Bot },
    { label: 'Status Webhook Meta Business', href: '/ai', icon: MessageSquareCode },
    { label: 'Basis Pengetahuan Produk Atsiri', href: '/ai', icon: BookOpen },
    { label: 'Analitik Kecepatan Respons', href: '/ai', icon: BarChart3 }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            <Bot className="size-4 sm:size-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">{t('title')}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">{t('subtitle')}</p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px] sm:text-xs">
          <MessageSquareCode className="mr-1 size-3 sm:size-3.5" /> {t('aiBadge')}
        </Badge>
      </div>

      <SummaryCardGrid items={kpis} />

      <QuickActions items={shortcuts} title={tCommon('quickActions.title')} />
    </div>
  )
}
