'use client'

import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSupplierCategoryOptions } from '@/hooks/sbi/scm/use-supplier-categories'

import type { SupplierFormValues } from '@/types/sbi/scm/supplier'

interface IdentitySectionProps {
  form: UseFormReturn<SupplierFormValues>
}

export function IdentitySection({ form }: IdentitySectionProps) {
  const t = useTranslations('scm.suppliers')
  const { data: categoryOptions = [] } = useSupplierCategoryOptions()

  const currentCategoryIds = form.watch('categoryIds') || []

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
                  <Input {...field} placeholder={t('form.fields.refPlaceholder')} className="h-8 font-mono text-xs" />
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
                  <Input {...field} placeholder={t('form.fields.namePlaceholder')} className="h-8 text-xs" />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>

        {/* Company Type (Company vs Person) using Native Select */}
        <FormField
          control={form.control}
          name="companyType"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs">{t('form.fields.companyType')} *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 w-full text-xs sm:w-64">
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

        {/* Dynamic Odoo Categories Selection */}
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
                    {opt.displayName || opt.name}
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground text-xs">No categories available</span>
            )}
          </div>
          {form.formState.errors.categoryIds && <p className="text-destructive text-[11px]">{form.formState.errors.categoryIds.message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
