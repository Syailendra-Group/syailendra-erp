'use client'

import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import type { SupplierFormValues } from '@/types/scm/supplier'

interface FinanceSectionProps {
  form: UseFormReturn<SupplierFormValues>
}

export function FinanceSection({ form }: FinanceSectionProps) {
  const t = useTranslations('scm.suppliers')

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{t('form.sections.finance')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Payment Terms */}
          <FormField
            control={form.control}
            name="paymentTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.paymentTerm')} *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t('form.fields.paymentTermPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="COD">{t('paymentTerms.cod')}</SelectItem>
                    <SelectItem value="PAID_BEFORE_SHIPMENT">{t('paymentTerms.paidBeforeShipment')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Legacy Accurate Code */}
          <FormField
            control={form.control}
            name="legacyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.legacyCode')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.legacyCodePlaceholder')} className="h-8 font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Banking Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Bank Name */}
          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.bankName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.bankNamePlaceholder')} className="h-8 text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Account Number */}
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.accountNumber')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.accountNumberPlaceholder')} className="h-8 font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Account Holder Name */}
          <FormField
            control={form.control}
            name="accountHolder"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.accountHolder')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.accountHolderPlaceholder')} className="h-8 text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Active Toggle Status */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-xs">{t('form.fields.active')}</FormLabel>
                <p className="text-muted-foreground text-[11px]">{field.value ? t('table.status.active') : t('table.status.archived')}</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
