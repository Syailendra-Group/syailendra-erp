/**
 * identity-section.tsx — Supplier identity: codes, company type, procurement categories, supplier type
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'

import { SwitchField } from '@/components/form/switch-field'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSupplierCategoryOptions } from '@/hooks/scm/use-supplier-categories'
import { useSupplierTypeOptions } from '@/hooks/scm/use-supplier-types'

import type { SupplierFormValues } from '@/types/scm/supplier'

interface IdentitySectionProps {
  form: UseFormReturn<SupplierFormValues>
}

export function IdentitySection({ form }: IdentitySectionProps) {
  // Translations
  const t = useTranslations('scm.suppliers')

  // Procurement grouping (res.partner.category) and flat business-actor type are separate concepts
  const { data: categoryOptions = [] } = useSupplierCategoryOptions()
  const { data: supplierTypeOptions = [] } = useSupplierTypeOptions()

  // Form state
  const currentCategoryIds = form.watch('categoryIds') || []
  const currentSupplierTypeId = form.watch('supplierTypeId')
  const currentVerified = form.watch('supplierTypeVerified')

  // Toggle a procurement category tag
  const toggleCategory = (catId: number) => {
    const exists = currentCategoryIds.includes(catId)
    const updated = exists ? currentCategoryIds.filter((id) => id !== catId) : [...currentCategoryIds, catId]
    form.setValue('categoryIds', updated, { shouldValidate: true })
  }

  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{t('form.sections.identity')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Supplier Reference Code */}
          <FormField
            control={form.control}
            name="ref"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.ref')} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.refPlaceholder')} className="font-mono text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Supplier Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t('form.fields.name')} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('form.fields.namePlaceholder')} className="text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Company Type (Company vs Person) */}
          <FormField
            control={form.control}
            name="companyType"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">{t('form.fields.companyType')} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder={t('form.fields.companyTypePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="company">{t('types.company')}</SelectItem>
                    <SelectItem value="person">{t('types.person')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Supplier Type (flat master: syailendra.supplier.type) */}
          <FormField
            control={form.control}
            name="supplierTypeId"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs">{t('form.fields.supplierType')}</FormLabel>
                <Select
                  value={field.value ? String(field.value) : 'none'}
                  onValueChange={(value) => {
                    const nextId = value === 'none' ? null : Number(value)
                    form.setValue('supplierTypeId', nextId, { shouldValidate: true })
                    if (!nextId) form.setValue('supplierTypeVerified', false)
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder={t('form.fields.supplierTypePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{t('form.fields.supplierTypeEmpty')}</SelectItem>
                    {supplierTypeOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.code} - {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Review flag clearance — only meaningful once a supplier type is chosen */}
        <SwitchField
          variant="card"
          label={t('form.fields.supplierTypeVerified')}
          hint={t('form.fields.supplierTypeVerifiedHint')}
          checked={currentVerified}
          disabled={!currentSupplierTypeId || form.formState.isSubmitting}
          onCheckedChange={(checked) => form.setValue('supplierTypeVerified', checked, { shouldValidate: true })}
          className="rounded-lg shadow-xs"
        />

        {/* Procurement grouping categories (res.partner.category) */}
        <div className="space-y-2">
          <FormLabel className="text-xs">{t('form.fields.categories')}</FormLabel>
          <div className="flex min-h-10.5 flex-wrap gap-1.5 rounded-md border p-2.5">
            {categoryOptions.length > 0 ? (
              categoryOptions.map((opt) => {
                const isSelected = currentCategoryIds.includes(opt.id)
                return (
                  <Badge
                    key={opt.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer px-2.5 py-1 text-xs font-normal transition-colors"
                    onClick={() => toggleCategory(opt.id)}
                  >
                    {opt.displayName}
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground text-xs">{t('form.fields.categoriesEmpty')}</span>
            )}
          </div>
          {form.formState.errors.categoryIds && <p className="text-destructive text-[11px]">{form.formState.errors.categoryIds.message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
