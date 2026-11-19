/**
 * summary-section.tsx — Read-only performance grade, asset counts, and Accurate provenance
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { ClipboardCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SectionCard } from '@/components/card/section-card'
import { DetailRow } from '@/components/shared/detail-row'
import { LongText } from '@/components/text'
import { Badge } from '@/components/ui/badge'

import type { SupplierGrade, SupplierRecord } from '@/types/scm/supplier'
import type { ReactElement } from 'react'

interface SummarySectionProps {
  record: SupplierRecord
}

export function SummarySection({ record }: SummarySectionProps): ReactElement {
  const t = useTranslations('scm.suppliers')

  // Explicit key map keeps next-intl keys statically resolvable
  const gradeLabels: Record<SupplierGrade, string> = {
    a: t('form.grades.a'),
    b: t('form.grades.b'),
    c: t('form.grades.c'),
    d: t('form.grades.d')
  }

  return (
    <SectionCard title={t('form.sections.summary')} icon={ClipboardCheck} contentClassName="space-y-3">
      {/* Performance grade (populated by the supplier evaluation module) */}
      <DetailRow
        label={t('form.fields.supplierGrade')}
        value={
          record.supplierGrade ? (
            <Badge variant="secondary" className="text-[10px]">
              {gradeLabels[record.supplierGrade]}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">{t('form.grades.none')}</span>
          )
        }
      />

      {/* Linked upstream assets */}
      <DetailRow label={t('form.fields.farmCount')} value={String(record.farmCount)} mono />
      <DetailRow label={t('form.fields.distilleryCount')} value={String(record.distilleryCount)} mono />

      {/* Legacy Accurate provenance trail */}
      <DetailRow
        label={t('form.fields.provenance')}
        value={record.provenance ? <LongText>{record.provenance}</LongText> : <span className="text-muted-foreground text-xs">-</span>}
        border={false}
      />
    </SectionCard>
  )
}
