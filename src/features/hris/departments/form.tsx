'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSaveDepartmentMutation } from '@/hooks/hris/use-departments'
import { departmentFormSchema } from '@/schemas/hris/department-schema'

import type { DepartmentRecord } from '@/actions/hris/department.action'
import type { DepartmentFormValues } from '@/schemas/hris/department-schema'
import type { ReactElement } from 'react'
import type { SubmitHandler } from 'react-hook-form'

export interface DepartmentsActionDialogProps {
  currentRow?: DepartmentRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DepartmentsActionDialog({ currentRow, open, onOpenChange, onSuccess }: DepartmentsActionDialogProps): ReactElement {
  const isEdit = !!currentRow
  const tAdmin = useTranslations('admin.departments')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveDepartment, isPending } = useSaveDepartmentMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      active: currentRow ? currentRow.active : true
    }
  })

  useEffect(() => {
    if (open) {
      reset({
        id: currentRow?.id,
        name: currentRow?.name || '',
        active: currentRow ? currentRow.active : true
      })
    }
  }, [open, currentRow, reset])

  const onSubmit: SubmitHandler<DepartmentFormValues> = async (values) => {
    try {
      const res = await saveDepartment(values)
      if (res.success) {
        toast.success(isEdit ? tAdmin('messages.updated') : tAdmin('messages.created'))
        reset()
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(res.error || tCommon('status.error'))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon('status.error')
      toast.error(msg)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset()
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? tAdmin('actions.edit') : tAdmin('actions.add')}</DialogTitle>
          <DialogDescription>{tAdmin('subtitle')}</DialogDescription>
        </DialogHeader>

        <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormFieldWrapper id="dept-name" label={tAdmin('fields.name')} required error={errors.name?.message}>
            <Input
              id="dept-name"
              placeholder={tAdmin('fields.name_placeholder')}
              disabled={isPending}
              className="h-8 text-xs"
              {...register('name')}
            />
          </FormFieldWrapper>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"

            onClick={() => {
              reset()
              onOpenChange(false)
            }}
            disabled={isPending}
          >
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" form="department-form" disabled={isPending} className="cursor-pointer font-semibold">
            {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {isEdit ? tCommon('actions.save') : tAdmin('actions.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
