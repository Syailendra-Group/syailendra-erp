/**
 * dialogs.tsx — Quick View DetailRow and ConfirmDialog Archive for Master Supplier
 * Syailendra Group ERP (SCM Pillar)
 */

'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { ConfirmDialog } from '@/components/dialog/confirm-dialog'
import { DetailRow } from '@/components/shared/detail-row'
import { Badge } from '@/components/ui/badge'
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

  const isViewOpen = open === 'view' && Boolean(selectedSupplier)
  const isArchiveOpen = (open === 'archive' || open === 'restore') && Boolean(selectedSupplier)

  return (
    <>
      {/* Quick View Inspection Dialog */}
      <ActionDialog
        open={isViewOpen}
        onOpenChange={(val) => {
          if (!val) {
            setOpen(null)
            setSelectedSupplier(null)
          }
        }}
        isView
        title={t('dialog.viewTitle')}
        description={t('dialog.viewDescription')}
        maxWidth="sm:max-w-lg"
      >
        {selectedSupplier && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1 rounded-md border p-3">
              <DetailRow label={t('table.columns.ref')} value={selectedSupplier.ref} mono />
              <DetailRow label={t('table.columns.name')} value={selectedSupplier.name} />
              <DetailRow
                label={t('table.columns.type')}
                value={
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedSupplier.isCompany ? t('types.company') : t('types.person')}
                  </Badge>
                }
              />
              <DetailRow
                label={t('table.columns.categories')}
                value={
                  selectedSupplier.categoryNames && selectedSupplier.categoryNames.length > 0 ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      {selectedSupplier.categoryNames.map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )
                }
              />
              <DetailRow label={t('form.fields.ownerName')} value={selectedSupplier.ownerName || '-'} />
              <DetailRow label={t('form.fields.picName')} value={selectedSupplier.picName || '-'} />
              <DetailRow label={t('form.fields.picPosition')} value={selectedSupplier.picPosition || '-'} />
              <DetailRow label={t('form.fields.joinYear')} value={selectedSupplier.joinYear ? String(selectedSupplier.joinYear) : '-'} mono />
              <DetailRow label={t('form.fields.mobile')} value={selectedSupplier.mobile || selectedSupplier.phone || '-'} mono />
              <DetailRow label={t('form.fields.email')} value={selectedSupplier.email || '-'} mono />
              <DetailRow label={t('form.fields.vat')} value={selectedSupplier.vat || '-'} mono />
              <DetailRow
                label={t('form.fields.street')}
                value={
                  [selectedSupplier.street, selectedSupplier.cityName || selectedSupplier.city, selectedSupplier.stateName]
                    .filter(Boolean)
                    .join(', ') || '-'
                }
              />
              <DetailRow label={t('form.fields.zip')} value={selectedSupplier.zip || '-'} mono />
              <DetailRow
                label={t('table.columns.paymentTerm')}
                value={
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {selectedSupplier.paymentTerm === 'COD' ? t('paymentTerms.cod') : t('paymentTerms.paidBeforeShipment')}
                  </Badge>
                }
              />
              {selectedSupplier.bankInfo && (
                <DetailRow
                  label={t('form.sections.finance')}
                  value={`${selectedSupplier.bankInfo.bankName} - ${selectedSupplier.bankInfo.accountNumber} a/n ${selectedSupplier.bankInfo.accountHolder}`}
                  mono
                />
              )}
              {selectedSupplier.legacyCode && <DetailRow label={t('form.fields.legacyCode')} value={selectedSupplier.legacyCode} mono />}
              <DetailRow label={t('form.fields.website')} value={selectedSupplier.website || '-'} mono />
              <DetailRow label={t('form.fields.nik')} value={selectedSupplier.nik || '-'} mono />
              <DetailRow label={t('form.fields.nib')} value={selectedSupplier.nib || '-'} mono />
              <DetailRow label={t('form.fields.businessLicense')} value={selectedSupplier.businessLicense || '-'} />
              {selectedSupplier.digitalCode && <DetailRow label={t('form.fields.digitalCode')} value={selectedSupplier.digitalCode} mono />}
              <DetailRow
                label={t('form.fields.supplierGrade')}
                value={selectedSupplier.supplierGrade ? t(`form.grades.${selectedSupplier.supplierGrade}`) : t('form.grades.none')}
              />
              <DetailRow label={t('table.columns.supplierStatus')} value={t(`form.statusOptions.${selectedSupplier.supplierStatus}`)} />
              <DetailRow
                label={t('table.columns.status')}
                value={
                  <Badge variant={selectedSupplier.active ? 'default' : 'outline'} className="text-[10px]">
                    {selectedSupplier.active ? t('table.status.active') : t('table.status.archived')}
                  </Badge>
                }
                border={false}
              />
            </div>
          </div>
        )}
      </ActionDialog>

      {/* Confirmation Dialog */}
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
    </>
  )
}
