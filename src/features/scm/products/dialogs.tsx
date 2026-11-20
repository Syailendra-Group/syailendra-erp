'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useProduct } from '@/contexts/scm/product.context'
import { useDeleteProductMutation, useToggleProductActiveMutation } from '@/hooks/scm/use-products'

import type { ReactElement } from 'react'

export function ProductsDialogs(): ReactElement {
  const { open, setOpen, currentRow } = useProduct()
  const t = useTranslations('scm.products')
  const tCommon = useTranslations('common')
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProductMutation()
  const toggleMutation = useToggleProductActiveMutation()

  const isDeleteOpen = open === 'delete'
  const isArchiveOpen = open === 'archive'
  const isRestoreOpen = open === 'restore'

  const handleToggle = async () => {
    if (!currentRow?.id) return
    const result = await toggleMutation.mutateAsync({ id: currentRow.id, active: !currentRow.active })
    if (result.success) {
      toast.success(
        currentRow.active ? t('toasts.archivedSuccess', { name: currentRow.name }) : t('toasts.restoredSuccess', { name: currentRow.name })
      )
      setOpen(null)
    } else toast.error(result.error || t('toasts.errorOccurred'))
  }

  const handleDelete = async () => {
    if (!currentRow?.id) return
    try {
      const res = await deleteProduct(currentRow.id)
      if (res.success) {
        toast.success(t('toasts.deletedSuccess', { name: currentRow.name }))
        setOpen(null)
      } else {
        toast.error(res.error || t('toasts.deleteRestrictedError', { name: currentRow.name }))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toasts.errorOccurred'))
    }
  }

  return (
    <>
      <ConfirmDialog
        open={isArchiveOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={t('archiveDialog.title')}
        desc={t('archiveDialog.description', { name: currentRow?.name || '' })}
        confirmText={tCommon('actions.archive')}
        cancelBtnText={tCommon('actions.cancel')}
        handleConfirm={handleToggle}
        isLoading={toggleMutation.isPending}
      />
      <ConfirmDialog
        open={isRestoreOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={t('restoreDialog.title')}
        desc={t('restoreDialog.description', { name: currentRow?.name || '' })}
        confirmText={tCommon('actions.restore')}
        cancelBtnText={tCommon('actions.cancel')}
        handleConfirm={handleToggle}
        isLoading={toggleMutation.isPending}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        title={t('deleteDialog.title')}
        desc={t('deleteDialog.description', {
          name: currentRow?.name || '',
          code: currentRow?.default_code || ''
        })}
        confirmText={t('deleteDialog.confirm')}
        cancelBtnText={t('deleteDialog.cancel')}
        destructive
        handleConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  )
}
