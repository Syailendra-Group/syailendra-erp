'use client'

import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import type { SupplierFormValues } from '@/types/scm/supplier'

interface ContactTaxSectionProps {
  form: UseFormReturn<SupplierFormValues>
}

export function ContactTaxSection({ form }: ContactTaxSectionProps) {
  const t = useTranslations('scm.suppliers')

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{t('form.sections.contact')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* PIC Contact Name */}
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.contactName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.contactNamePlaceholder')} className="h-8 text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Email Address */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.email')}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder={t('form.fields.emailPlaceholder')} className="h-8 font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Mobile / WhatsApp Number */}
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.mobile')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.mobilePlaceholder')} className="h-8 font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Phone (Office / Alternative) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.phone')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.phonePlaceholder')} className="h-8 font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Tax Identification (NPWP / NIK) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="vat"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.vat')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.vatPlaceholder')} className="h-8 font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
