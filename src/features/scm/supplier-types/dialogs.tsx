/**
 * dialogs.tsx — Supplier Types ActionDialog and view detail (archive, never unlink)
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
import { useSupplierTypeContext } from '@/contexts/scm/supplier-type.context'
import { useSetSupplierTypeActive } from '@/hooks/scm/use-supplier-types'

import { SupplierTypeForm } from './form'

import type { SupplierTypeRecord } from '@/types/scm/supplier-type'

export function SupplierTypeDialogs() {
  const t = useTranslations('scm.supplierTypes')
  const { open, setOpen, selectedType, setSelectedType } = useSupplierTypeContext()
  const setStatusMutation = useSetSupplierTypeActive()
  const [isFormPending, setIsFormPending] = useState(false)

  const isFormOpen = open === 'create' || open === 'edit'
  const isEdit = open === 'edit' && Boolean(selectedType)
  const isViewOpen = open === 'view' && Boolean(selectedType)
  const isStatusOpen = open === 'status' && Boolean(selectedType)
  const statusTarget = isStatusOpen ? selectedType : null

  const handleToggleStatus = async () => {
    if (!statusTarget) return

    try {
      const res = await setStatusMutation.mutateAsync({ id: statusTarget.id, active: !statusTarget.active })
      if (res.success) {
        toast.success(statusTarget.active ? t('toast.archiveSuccess') : t('toast.restoreSuccess'))
        setOpen(null)
        setSelectedType(null)
      } else {
        toast.error(res.error || t('toast.statusError'))
      }
    } catch {
      toast.error(t('toast.statusError'))
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
            setSelectedType(null)
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
          selectedType={selectedType}
          isEdit={isEdit}
          onSuccess={() => {
            setOpen(null)
            setSelectedType(null)
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
            setSelectedType(null)
          }
        }}
        isView
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDescription')}
        maxWidth="sm:max-w-md"
      >
        {selectedType && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1 rounded-md border p-3">
              <DetailRow label={t('table.columns.code')} value={selectedType.code} mono />
              <DetailRow label={t('table.columns.name')} value={selectedType.name} />
              <DetailRow label={t('table.columns.description')} value={selectedType.description || '-'} />
              <DetailRow label={t('table.columns.supplierCount')} value={String(selectedType.supplierCount)} mono />
              <DetailRow label={t('table.columns.sequence')} value={String(selectedType.sequence)} mono />
              <DetailRow
                label={t('table.columns.status')}
                value={
                  <Badge variant={selectedType.active ? 'default' : 'outline'} className="text-[10px]">
                    {selectedType.active ? t('table.status.active') : t('table.status.inactive')}
                  </Badge>
                }
                border={false}
              />
            </div>
          </div>
        )}
      </ActionDialog>

      {/* Archive / Restore Confirmation */}
      <ConfirmDialog
        open={isStatusOpen}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setSelectedType(null)
          }
        }}
        title={statusTarget?.active ? t('dialog.archiveTitle') : t('dialog.restoreTitle')}
        desc={statusTarget?.active ? t('dialog.archiveDescription') : t('dialog.restoreDescription')}
        confirmText={statusTarget?.active ? t('actions.archive') : t('actions.restore')}
        cancelBtnText={t('form.buttons.cancel')}
        destructive={Boolean(statusTarget?.active)}
        isLoading={setStatusMutation.isPending}
        handleConfirm={handleToggleStatus}
      />
    </>
  )
}

export type { SupplierTypeRecord }
