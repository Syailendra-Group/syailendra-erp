'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ActionDialog } from '@/components/dialog/action-dialog'
import { FormFieldWrapper } from '@/components/form/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { useSaveDepartmentMutation } from '@/hooks/sbi/hrm/use-departments'
import { getDepartmentFormSchema } from '@/schemas/sbi/hrm/department-schema'

import type { DepartmentRecord } from '@/actions/sbi/hrm/department.action'
import type { DepartmentFormValues } from '@/schemas/sbi/hrm/department-schema'
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
    resolver: zodResolver(getDepartmentFormSchema(tAdmin)),
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
    <ActionDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset()
          onOpenChange(false)
        }
      }}
      title={isEdit ? tAdmin('actions.edit') : tAdmin('actions.add')}
      description={tAdmin('subtitle')}
      formId="department-form"
      isPending={isPending}
      isEdit={isEdit}
      maxWidth="sm:max-w-md"
    >
      <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1">
        <FormFieldWrapper id="dept-name" label={tAdmin('fields.name')} required error={errors.name?.message}>
          <Input id="dept-name" placeholder={tAdmin('fields.name_placeholder')} disabled={isPending} className="h-8 text-xs" {...register('name')} />
        </FormFieldWrapper>
      </form>
    </ActionDialog>
  )
}
