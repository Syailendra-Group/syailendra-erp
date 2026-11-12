'use client'

import { Building, Globe, Mail, MapPin, Phone, Save, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { ReactElement } from 'react'

export function CompanyFeature(): ReactElement {
  const t = useTranslations('others.company')

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

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Core Corporate Identity */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">{t('sections.core.title')}</CardTitle>
            <CardDescription className="text-xs">{t('sections.core.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t('fields.name')}</Label>
              <Input defaultValue="PT Syailendra Bumi Investama" placeholder={t('fields.namePlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t('fields.tagline')}</Label>
              <Input defaultValue="Specialty Essential Oil & Fine Robusta Processing" placeholder={t('fields.taglinePlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t('fields.currency')}</Label>
              <Input defaultValue="IDR (Rp) - Indonesian Rupiah" disabled className="bg-muted/50" />
            </div>
          </CardContent>
        </Card>

        {/* Communication Channels & Web Portal */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">{t('sections.comms.title')}</CardTitle>
            <CardDescription className="text-xs">{t('sections.comms.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Mail className="text-primary size-3.5" />
                <span>{t('fields.email')}</span>
              </Label>
              <Input defaultValue="info@ddistillers.com" type="email" placeholder={t('fields.emailPlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Phone className="text-primary size-3.5" />
                <span>{t('fields.phone')}</span>
              </Label>
              <Input defaultValue="+62 21 8060 8899" placeholder={t('fields.phonePlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Globe className="text-primary size-3.5" />
                <span>{t('fields.website')}</span>
              </Label>
              <Input defaultValue="https://syailendragroup.com" placeholder={t('fields.websitePlaceholder')} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="text-primary size-3.5" />
                <span>{t('fields.address')}</span>
              </Label>
              <Input defaultValue="Jl. Raya Parakan - Wonosobo KM 12, Temanggung, Jawa Tengah" placeholder={t('fields.addressPlaceholder')} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2 font-semibold">
          <Save className="size-4" />
          <span>{t('saveButton')}</span>
        </Button>
      </div>
    </div>
  )
}
