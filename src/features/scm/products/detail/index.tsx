'use client'

import { Edit2, Package, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { LinkButton } from '@/components/button/link-button'
import { SectionCard } from '@/components/card/section-card'
import { SummaryCardGrid } from '@/components/card/summary-card'
import { EntityIdentityCell } from '@/components/image/entity-identity-cell'
import { MediaGallery } from '@/components/image/media-gallery'
import { DataBadge } from '@/components/shared/data-badge'
import { DetailRow } from '@/components/shared/detail-row'
import { PageHeader } from '@/components/shared/page-header'

import type { SummaryCardItem } from '@/components/card/summary-card'
import type { ProductRecord } from '@/types/scm/product'
import type { ReactElement } from 'react'

export interface ProductDetailProps {
  product: ProductRecord
}

export function ProductDetail({ product }: ProductDetailProps): ReactElement {
  const t = useTranslations('scm.products')
  const tCommon = useTranslations('common')
  const summary: SummaryCardItem[] = [
    { title: t('fields.category'), value: t(`categories.${product.category}`), icon: Package, color: 'text-primary' },
    { title: t('fields.tracking'), value: t(`trackingOptions.${product.tracking}`), icon: ShieldCheck, color: 'text-emerald-600' },
    {
      title: t('fields.shelfLifeMonths'),
      value: String(product.shelf_life_months),
      subtitle: t('detail.months'),
      icon: Sparkles,
      color: 'text-amber-600'
    },
    {
      title: tCommon('status.title'),
      value: product.active ? tCommon('status.active') : tCommon('status.archived'),
      icon: Package,
      color: 'text-blue-600'
    }
  ]
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack
        backHref="/scm/products"
        title={product.name}
        description={t('detail.description')}
        titleBadge={
          <span className="border-primary/20 bg-primary/10 text-primary rounded border px-2 py-0.5 font-mono text-xs font-semibold">
            {product.default_code}
          </span>
        }
        actions={<LinkButton href={`/scm/products/${product.id}/edit`} icon={Edit2} label={t('detail.edit')} />}
      />
      <SummaryCardGrid items={summary} />
      <EntityIdentityCell name={product.name} secondary={product.commercial_name} imageUrl={product.imageUrl} className="max-w-96" />
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <SectionCard title={t('sections.commercialAndBotanical')} description={t('detail.identityDescription')} icon={Package}>
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <DetailRow label={t('fields.defaultCode')} value={product.default_code} mono />
            <DetailRow label={t('fields.commercialName')} value={product.commercial_name || '-'} />
            <DetailRow label={t('fields.botanicalName')} value={product.botanical_name || '-'} />
            <DetailRow label={t('fields.family')} value={product.family || '-'} />
            <DetailRow label={t('fields.inciName')} value={product.inci_name || '-'} />
            <DetailRow label={t('fields.plantPart')} value={product.plant_part || '-'} />
            <DetailRow label={t('fields.extractionMethod')} value={t(`extractionMethods.${product.extraction_method}`)} />
            <DetailRow label={t('fields.aromaNote')} value={product.aroma_note ? t(`aromaNotes.${product.aroma_note}`) : '-'} />
            <DetailRow label={t('fields.uom')} value={product.uom_id?.[1] || '-'} mono />
            <DetailRow label={t('fields.description')} value={product.description || '-'} />
          </div>
        </SectionCard>
        <SectionCard title={t('sections.exportCompliance')} description={t('detail.exportDescription')} icon={ShieldCheck}>
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
            <DetailRow label={t('fields.casNumber')} value={product.cas_number || '-'} mono />
            <DetailRow label={t('fields.einecsNumber')} value={product.einecs_number || '-'} mono />
            <DetailRow label={t('fields.femaNumber')} value={product.fema_number || '-'} mono />
            <DetailRow label={t('fields.hsCode')} value={product.hs_code || '-'} mono />
          </div>
        </SectionCard>
      </div>
      <SectionCard title={t('sections.qcStandards')} description={t('detail.qcDescription')} icon={Sparkles}>
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
          <DetailRow label={t('fields.relativeDensity')} value={product.qc_specs?.relative_density_20c || '-'} mono />
          <DetailRow label={t('fields.refractiveIndex')} value={product.qc_specs?.refractive_index_20c || '-'} mono />
          <DetailRow label={t('fields.opticalRotation')} value={product.qc_specs?.optical_rotation_20c || '-'} mono />
          <DetailRow
            label={t('fields.flashPoint')}
            value={product.qc_specs?.flash_point_c !== undefined ? `${product.qc_specs.flash_point_c} °C` : '-'}
            mono
          />
          <DetailRow label={t('fields.ethanolSolubility')} value={product.qc_specs?.ethanol_solubility || '-'} />
          <DetailRow label={t('fields.keyCompounds')} value={product.qc_specs?.key_compounds || '-'} />
        </div>
      </SectionCard>
      <MediaGallery model="product.template" recordId={product.id} role="product" readOnly legacyImageUrl={product.imageUrl} />
    </div>
  )
}

export function ProductNotFound(): ReactElement {
  const t = useTranslations('scm.products')
  return (
    <div className="space-y-6">
      <PageHeader showBack backHref="/scm/products" title={t('detail.notFound')} />
      <DataBadge variant="neutral">{t('detail.notFound')}</DataBadge>
    </div>
  )
}
