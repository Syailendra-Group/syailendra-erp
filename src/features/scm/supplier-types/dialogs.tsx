'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSupplierTypeContext } from '@/contexts/scm/supplier-type.context'
import { useDeleteSupplierType } from '@/hooks/scm/use-supplier-types'

import { SupplierTypeForm } from './form'

export function SupplierTypeDialogs() {
  const t = useTranslations('scm.supplierTypes')
  const { open, setOpen, selectedCategory, setSelectedCategory } = useSupplierTypeContext()
  const deleteMutation = useDeleteSupplierType()
  const [isFormPending, setIsFormPending] = useState(false)

  const isFormOpen = open === 'create' || open === 'edit'
  const isEdit = open === 'edit' && Boolean(selectedCategory)
  const isViewOpen = open === 'view' && Boolean(selectedCategory)
  const isDeleteOpen = open === 'delete' && Boolean(selectedCategory)

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
        formId="supplier-type-form"
        isPending={isFormPending}
        isEdit={isEdit}
        maxWidth="sm:max-w-lg"
      >
        <SupplierTypeForm
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
      <Dialog
        open={isViewOpen}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setSelectedCategory(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{t('dialog.viewTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('dialog.viewDescription')}</DialogDescription>
          </DialogHeader>

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
                        {t('table.rootCategory')}
                      </Badge>
                    )
                  }
                />
                <DetailRow label={t('table.columns.partnerCount')} value={String(selectedCategory.partnerCount)} mono />
                <DetailRow
                  label={t('table.columns.status')}
                  value={
                    <Badge variant={selectedCategory.active ? 'default' : 'outline'} className="text-[10px]">
                      {selectedCategory.active ? t('table.status.active') : t('table.status.inactive')}
                    </Badge>
                  }
                  border={false}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
        desc={t('dialog.deleteDescription')}
        confirmText={t('actions.delete')}
        cancelBtnText={t('form.buttons.cancel')}
        destructive
        isLoading={deleteMutation.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
