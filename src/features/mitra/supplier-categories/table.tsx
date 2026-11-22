'use client'

import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PrimaryAction } from '@/components/button/primary-action'
import { ActionDialog } from '@/components/dialog/action-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSupplierCategories } from '@/hooks/scm/use-supplier-categories'

import { SupplierCategoryForm } from './form'

import type { SupplierCategoryRecord } from '@/types/scm/supplier-category'
import type { ReactElement } from 'react'

function depthIndent(depth: number): string {
  return `pl-${Math.max(0, depth) * 4}`
}

function statusChip(active: boolean, t: (key: string) => string): ReactElement {
  return (
    <Badge variant={active ? 'default' : 'secondary'} className="text-[10px]">
      {active ? t('table.status.active') : t('table.status.inactive')}
    </Badge>
  )
}

export function SupplierCategoriesTable(): ReactElement {
  const t = useTranslations('mitra.supplierCategories')
  const { data: response = { items: [], total: 0 }, isPending } = useSupplierCategories()
  const items: SupplierCategoryRecord[] = response.items ?? []
  const [open, setOpen] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<SupplierCategoryRecord | null>(null)

  const isCreate = open === 'create'
  const isEdit = open === 'edit' && Boolean(selected)
  const siblings = open === 'edit' && selected ? items.filter((item) => item.id !== selected.id) : items

  const handleCreate = useCallback(() => {
    setSelected(null)
    setOpen('create')
  }, [])

  const handleEdit = useCallback((item: SupplierCategoryRecord) => {
    setSelected(item)
    setOpen('edit')
  }, [])

  const handleClose = useCallback(() => {
    setOpen(null)
    setSelected(null)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t('title')}</h2>
        <PrimaryAction onClick={handleCreate} label={t('actions.create')} icon={Plus} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 text-xs">{t('table.columns.name')}</TableHead>
              <TableHead className="w-48 text-xs">{t('table.columns.parent')}</TableHead>
              <TableHead className="w-24 text-xs">{t('table.columns.color')}</TableHead>
              <TableHead className="w-20 text-xs">{t('table.columns.status')}</TableHead>
              <TableHead className="w-20 text-xs">{t('table.columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className={depthIndent(item.depth)}>
                <TableCell className="text-xs font-medium">
                  {item.depth > 0 ? '↳ ' : ''}
                  {item.name}
                </TableCell>
                <TableCell className="text-xs">
                  {item.parentName ? (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.parentName}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">
                      {t('table.rootType')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="text-[10px]">
                    Tag {item.color}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{statusChip(item.active, t)}</TableCell>
                <TableCell className="text-xs">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                    <Plus className="size-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-4 text-center text-xs">
                  {t('table.emptyState')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isPending && <p className="text-muted-foreground text-xs">{t('actions.saving')}</p>}

      <ActionDialog
        open={isCreate || isEdit}
        onOpenChange={(val) => {
          if (!val) handleClose()
        }}
        title={isEdit ? t('form.editTitle') : t('form.createTitle')}
        description={t('form.description')}
        formId="supplier-category-form"
        isEdit={isEdit}
        maxWidth="sm:max-w-lg"
      >
        <SupplierCategoryForm selectedCategory={selected ?? null} isEdit={isEdit} siblings={siblings} onSuccess={handleClose} />
      </ActionDialog>
    </div>
  )
}
