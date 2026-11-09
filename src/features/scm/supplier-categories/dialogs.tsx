'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSupplierCategoryContext } from '@/contexts/scm/supplier-category.context'
import { useDeleteSupplierCategory } from '@/hooks/scm/use-supplier-categories'

import { SupplierCategoryFormDialog } from './form'

export function SupplierCategoryDialogs() {
  const t = useTranslations('scm.supplierCategories')
  const { open, setOpen, selectedCategory, setSelectedCategory } = useSupplierCategoryContext()
  const deleteMutation = useDeleteSupplierCategory()

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

  const isViewOpen = open === 'view' && Boolean(selectedCategory)
  const isDeleteOpen = open === 'delete' && Boolean(selectedCategory)

  return (
    <>
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

      {/* Form Dialog */}
      <SupplierCategoryFormDialog />

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
