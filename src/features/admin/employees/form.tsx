'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { employeeFormSchema } from '@/schemas/employee'

import { saveEmployeeAction } from './actions'

import type { EmployeeFormValues } from '@/schemas/employee'
import type { SubmitHandler } from 'react-hook-form'
import type { DepartmentOption, EmployeeRecord } from './actions'

export interface EmployeeFormProps {
  initialData?: EmployeeRecord | null
  departments: DepartmentOption[]
  onSuccess: () => void
  onCancel: () => void
}

export function EmployeeForm({ initialData, departments, onSuccess, onCancel }: EmployeeFormProps): React.ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')
  const [isPending, startTransition] = React.useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      work_email: initialData?.work_email || '',
      work_phone: initialData?.work_phone || '',
      job_title: initialData?.job_title || '',
      department_id: initialData?.department_id ? initialData.department_id[0] : departments[0]?.id || 1
    }
  })

  const onSubmit: SubmitHandler<EmployeeFormValues> = (values) => {
    startTransition(async () => {
      const res = await saveEmployeeAction(values)
      if (res.success) {
        toast.success(initialData ? tAdmin('messages.updated') : tAdmin('messages.created'))
        onSuccess()
      } else {
        toast.error(res.error || 'Failed to save employee')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {/* Full Name */}
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name" className="text-xs font-semibold">
            {tAdmin('fields.name')}
          </FieldLabel>
          <Input id="name" placeholder={tAdmin('fields.name_placeholder')} disabled={isPending} {...register('name')} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        {/* Job Title */}
        <Field data-invalid={!!errors.job_title}>
          <FieldLabel htmlFor="job_title" className="text-xs font-semibold">
            {tAdmin('fields.job_title')}
          </FieldLabel>
          <Input id="job_title" placeholder={tAdmin('fields.job_title_placeholder')} disabled={isPending} {...register('job_title')} />
          {errors.job_title && <FieldError>{errors.job_title.message}</FieldError>}
        </Field>

        {/* Department Select */}
        <Field data-invalid={!!errors.department_id}>
          <FieldLabel htmlFor="department_id" className="text-xs font-semibold">
            {tAdmin('fields.department')}
          </FieldLabel>
          <Select
            defaultValue={String(initialData?.department_id ? initialData.department_id[0] : departments[0]?.id || '')}
            onValueChange={(val) => setValue('department_id', Number(val))}
            disabled={isPending}
          >
            <SelectTrigger id="department_id">
              <SelectValue placeholder={tAdmin('fields.department_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department_id && <FieldError>{errors.department_id.message}</FieldError>}
        </Field>

        {/* Work Email */}
        <Field data-invalid={!!errors.work_email}>
          <FieldLabel htmlFor="work_email" className="text-xs font-semibold">
            {tAdmin('fields.work_email')}
          </FieldLabel>
          <Input
            id="work_email"
            type="email"
            placeholder={tAdmin('fields.work_email_placeholder')}
            disabled={isPending}
            {...register('work_email')}
          />
          {errors.work_email && <FieldError>{errors.work_email.message}</FieldError>}
        </Field>

        {/* Work Phone */}
        <Field data-invalid={!!errors.work_phone}>
          <FieldLabel htmlFor="work_phone" className="text-xs font-semibold">
            {tAdmin('fields.work_phone')}
          </FieldLabel>
          <Input id="work_phone" placeholder={tAdmin('fields.work_phone_placeholder')} disabled={isPending} {...register('work_phone')} />
          {errors.work_phone && <FieldError>{errors.work_phone.message}</FieldError>}
        </Field>
      </FieldGroup>

      {/* Action buttons */}
      <Field orientation="horizontal" className="justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          {tCommon('actions.cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={isPending} className="gap-2 font-semibold">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {tCommon('actions.save')}
        </Button>
      </Field>
    </form>
  )
}
