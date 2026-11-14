'use client'

import { Palette } from 'lucide-react'

import { SectionCard } from '@/components/card/section-card'
import { ColorInput } from '@/components/form/color-input'
import { Separator } from '@/components/ui/separator'

import type { SiteConfigFormValues } from '@/schemas/others/website-schema'
import type { ReactElement } from 'react'
import type { UseFormReturn } from 'react-hook-form'

interface ThemePaletteSectionProps {
  form: UseFormReturn<SiteConfigFormValues>
  t: (key: string) => string
}

const COLOR_FIELDS: {
  id: 'primary_light' | 'primary_dark' | 'bg_light' | 'bg_dark' | 'accent_gold'
  labelKey: string
  descKey: string
  defaultHex: string
}[] = [
  { id: 'primary_light', labelKey: 'colors.primaryLight', descKey: 'colors.primaryLightDesc', defaultHex: '#004e52' },
  { id: 'primary_dark', labelKey: 'colors.primaryDark', descKey: 'colors.primaryDarkDesc', defaultHex: '#008187' },
  { id: 'bg_light', labelKey: 'colors.bgLight', descKey: 'colors.bgLightDesc', defaultHex: '#fffdee' },
  { id: 'bg_dark', labelKey: 'colors.bgDark', descKey: 'colors.bgDarkDesc', defaultHex: '#181c20' },
  { id: 'accent_gold', labelKey: 'colors.accentGold', descKey: 'colors.accentGoldDesc', defaultHex: '#e8ae1e' }
]

export function ThemePaletteSection({ form, t }: ThemePaletteSectionProps): ReactElement {
  const {
    watch,
    setValue,
    formState: { errors }
  } = form

  const primaryLight = watch('primary_light') || '#004e52'
  const primaryDark = watch('primary_dark') || '#008187'
  const bgLight = watch('bg_light') || '#fffdee'
  const bgDark = watch('bg_dark') || '#181c20'
  const accentGold = watch('accent_gold') || '#e8ae1e'

  return (
    <SectionCard title={t('sections.palette.title')} description={t('sections.palette.subtitle')} icon={Palette} contentClassName="space-y-4">
      {/* 2-Column Responsive Grid for Color Inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COLOR_FIELDS.map(({ id, labelKey, descKey, defaultHex }) => (
          <ColorInput
            key={id}
            id={id}
            label={t(labelKey)}
            value={watch(id) || defaultHex}
            onChange={(hex) => setValue(id, hex, { shouldDirty: true, shouldValidate: true })}
            description={t(descKey)}
            error={errors[id]?.message}
            required
            className={id === 'accent_gold' ? 'sm:col-span-2' : undefined}
          />
        ))}
      </div>

      <Separator />

      {/* Live Dual-Mode Theme Preview */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold">{t('preview.title')}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Light Preview */}
          <div className="space-y-2 rounded-xl border p-3.5 shadow-xs" style={{ backgroundColor: bgLight, color: '#111111' }}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{t('preview.lightMode')}</span>
              <span className="font-mono text-[10px] opacity-70">{primaryLight}</span>
            </div>
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-xs"
              style={{
                backgroundImage: `linear-gradient(180deg, ${primaryLight} 0%, color-mix(in srgb, ${primaryLight} 70%, #000000) 100%)`
              }}
            >
              <span>SYAILENDRA ERP</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-black" style={{ backgroundColor: accentGold }}>
                Active
              </span>
            </div>
          </div>

          {/* Dark Preview */}
          <div className="space-y-2 rounded-xl border p-3.5 shadow-xs" style={{ backgroundColor: bgDark, color: '#f8fafc' }}>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>{t('preview.darkMode')}</span>
              <span className="font-mono text-[10px] opacity-70">{primaryDark}</span>
            </div>
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-xs"
              style={{
                backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${primaryDark} 72%, #000000) 0%, color-mix(in srgb, ${primaryDark} 42%, #000000) 100%)`
              }}
            >
              <span>SYAILENDRA ERP</span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-black" style={{ backgroundColor: accentGold }}>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
