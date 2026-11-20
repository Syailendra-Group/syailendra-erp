/**
 * dialogs.tsx — Archive / restore confirmation for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 *
 * Supplier inspection lives on the dedicated detail page (/scm/suppliers/[id]),
 * so only the lifecycle confirmation dialog remains in this module.
 */

'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { useSupplierContext } from '@/contexts/scm/supplier.context'
import { useToggleSupplierStatus } from '@/hooks/scm/use-suppliers'

export function SupplierDialogs() {
  const t = useTranslations('scm.suppliers')
  const { open, setOpen, selectedSupplier, setSelectedSupplier } = useSupplierContext()
  const toggleMutation = useToggleSupplierStatus()

  const handleToggleStatus = async () => {
    if (!selectedSupplier) return

    const targetStatus = !selectedSupplier.active
    try {
      const res = await toggleMutation.mutateAsync({
        id: selectedSupplier.id,
        active: targetStatus
      })
      if (res.success) {
        toast.success(targetStatus ? t('toast.restoreSuccess') : t('toast.archiveSuccess'))
        setOpen(null)
        setSelectedSupplier(null)
      } else {
        toast.error(res.error || t('toast.deleteError'))
      }
    } catch {
      toast.error(t('toast.deleteError'))
    }
  }

  const isArchiveOpen = (open === 'archive' || open === 'restore') && Boolean(selectedSupplier)

  return (
    <ConfirmDialog
      open={isArchiveOpen}
      onOpenChange={(val) => {
        if (!val) {
          setOpen(null)
          setSelectedSupplier(null)
        }
      }}
      title={selectedSupplier?.active ? t('dialog.archiveTitle') : t('dialog.restoreTitle')}
      desc={
        selectedSupplier?.active
          ? t('dialog.archiveDescription', { name: selectedSupplier?.name || '' })
          : t('dialog.restoreDescription', { name: selectedSupplier?.name || '' })
      }
      confirmText={selectedSupplier?.active ? t('actions.archive') : t('actions.restore')}
      cancelBtnText={t('form.buttons.cancel')}
      destructive={selectedSupplier?.active}
      isLoading={toggleMutation.isPending}
      handleConfirm={handleToggleStatus}
    />
  )
}
