/**
 * dialogs.tsx — Supplier Categories ActionDialog, view detail, and delete confirmation
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { useSupplierCategoryContext } from '@/contexts/scm/supplier-category.context'
import { useDeleteSupplierCategory, useSupplierCategoryUsage } from '@/hooks/scm/use-supplier-categories'

import { SupplierCategoryForm } from './form'

export function SupplierCategoryDialogs() {
  const t = useTranslations('scm.supplierCategories')
  const tCommon = useTranslations('common')
  const { open, setOpen, selectedCategory, setSelectedCategory } = useSupplierCategoryContext()
  const deleteMutation = useDeleteSupplierCategory()
  const [isFormPending, setIsFormPending] = useState(false)

  const isFormOpen = open === 'create' || open === 'edit'
  const isEdit = open === 'edit' && Boolean(selectedCategory)
  const isViewOpen = open === 'view' && Boolean(selectedCategory)
  const isDeleteOpen = open === 'delete' && Boolean(selectedCategory)

  const usageQuery = useSupplierCategoryUsage(isDeleteOpen && selectedCategory ? selectedCategory.id : null)
  const usageCount = usageQuery.data ?? 0

  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      const res = await deleteMutation.mutateAsync(selectedCategory.id)
      if (res.success) {
        toast.success(t('toast.deleteSuccess'))
        setOpen(null)
        setSelectedCategory(null)
      } else if (res.isRelational) {
        toast.error(t('toast.deleteErrorRelational'))
      } else {
        toast.error(res.error || t('toast.deleteError'))
      }
    } catch {
      toast.error(t('toast.deleteError'))
    }
  }

  return (
    <>
      {/* Form ActionDialog */}
      <ActionDialog
        open={isFormOpen}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setSelectedCategory(null)
          }
        }}
        title={isEdit ? t('form.editTitle') : t('form.createTitle')}
        description={t('form.description')}
        formId="supplier-category-form"
        isPending={isFormPending}
        isEdit={isEdit}
        maxWidth="sm:max-w-lg"
      >
        <SupplierCategoryForm
          selectedCategory={selectedCategory}
          isEdit={isEdit}
          onSuccess={() => {
            setOpen(null)
            setSelectedCategory(null)
          }}
          onPendingChange={setIsFormPending}
        />
      </ActionDialog>

      {/* View Detail Dialog */}
      <ActionDialog
        open={isViewOpen}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setSelectedCategory(null)
          }
        }}
        isView
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDescription')}
        maxWidth="sm:max-w-lg"
      >
        {selectedCategory && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1 rounded-md border p-3">
              <DetailRow label={t('table.columns.name')} value={selectedCategory.name} />
              <DetailRow label={t('table.columns.displayName')} value={selectedCategory.displayName} />
              <DetailRow
                label={t('table.columns.parent')}
                value={
                  selectedCategory.parentName ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedCategory.parentName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      {t('table.rootType')}
                    </Badge>
                  )
                }
              />
              <DetailRow label={t('table.columns.supplierCount')} value={String(selectedCategory.supplierCount)} mono />
              <DetailRow label={t('table.columns.childCount')} value={String(selectedCategory.childCount)} mono />
              <DetailRow
                label={t('table.columns.status')}
                value={
                  <Badge variant={selectedCategory.active ? 'default' : 'outline'} className="text-[10px]">
                    {selectedCategory.active ? tCommon('status.active') : tCommon('status.inactive')}
                  </Badge>
                }
                border={false}
              />
            </div>
          </div>
        )}
      </ActionDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setSelectedCategory(null)
          }
        }}
        title={t('dialog.deleteTitle')}
        desc={usageCount > 0 ? t('dialog.deleteDescriptionWithUsage', { count: usageCount }) : t('dialog.deleteDescription')}
        confirmText={t('actions.delete')}
        cancelBtnText={t('form.buttons.cancel')}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
