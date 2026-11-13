'use client'

import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { SupplierFormValues } from '@/types/scm/supplier'

interface AddressSectionProps {
  form: UseFormReturn<SupplierFormValues>
}

export function AddressSection({ form }: AddressSectionProps) {
  const t = useTranslations('scm.suppliers')

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{t('form.sections.address')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full Street Address (Mandatory Textarea as per Rule 11) */}
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">{t('form.fields.street')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} placeholder={t('form.fields.streetPlaceholder')} className="resize-none text-xs" />
              </FormControl>
              <FormMessage className="text-[11px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Postal Code (Zip) */}
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.zip')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.zipPlaceholder')} className="font-mono text-xs" />
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
