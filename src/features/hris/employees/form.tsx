'use client'

import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { SelectForm } from '@/components/form/select-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSaveEmployeeMutation } from '@/hooks/hris/use-employees'
import { getEmployeeFormSchema } from '@/schemas/hris/employee-schema'

import type { DepartmentOption, EmployeeRecord } from '@/actions/hris/employee.action'
import type { EmployeeFormValues } from '@/schemas/hris/employee-schema'
import type { ReactElement } from 'react'

export interface EmployeesActionDialogProps {
  currentRow?: EmployeeRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  departments: DepartmentOption[]
  onSuccess: () => void
}

export function EmployeesActionDialog({ currentRow, open, onOpenChange, departments, onSuccess }: EmployeesActionDialogProps): ReactElement {
  const isEdit = !!currentRow
  const tAdmin = useTranslations('admin.employees')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveEmployee, isPending } = useSaveEmployeeMutation()

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(getEmployeeFormSchema(tAdmin)),
    defaultValues: {
      id: currentRow?.id,
      name: currentRow?.name || '',
      work_email: currentRow?.work_email || '',
      work_phone: currentRow?.work_phone || '',
      job_title: currentRow?.job_title || '',
      department_id: currentRow?.department_id ? currentRow.department_id[0] : departments[0]?.id || 1
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        id: currentRow?.id,
        name: currentRow?.name || '',
        work_email: currentRow?.work_email || '',
        work_phone: currentRow?.work_phone || '',
        job_title: currentRow?.job_title || '',
        department_id: currentRow?.department_id ? currentRow.department_id[0] : departments[0]?.id || 1
      })
    }
  }, [open, currentRow, departments, form])

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      const res = await saveEmployee(values)
      if (res.success) {
        toast.success(isEdit ? tAdmin('messages.updated') : tAdmin('messages.created'))
        form.reset()
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
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? tAdmin('actions.edit') : tAdmin('actions.add')}</DialogTitle>
          <DialogDescription>{tAdmin('subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto py-1 pe-1">
          <Form {...form}>
            <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-semibold">{tAdmin('fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={tAdmin('fields.name_placeholder')} className="h-8 text-xs" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">{tAdmin('fields.job_title')}</FormLabel>
                      <FormControl>
                        <Input placeholder={tAdmin('fields.job_title_placeholder')} className="h-8 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">{tAdmin('fields.department')}</FormLabel>
                      <SelectForm
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(val) => field.onChange(Number(val))}
                        placeholder={tAdmin('fields.department_placeholder')}
                        addNewAction={true}
                        addNewHref="/admin/departments"
                        addNewLabel={tAdmin('actions.addDepartment')}
                        items={departments.map((d) => ({
                          label: d.name,
                          value: String(d.id)
                        }))}
                      />
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Work Email */}
                <FormField
                  control={form.control}
                  name="work_email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">{tAdmin('fields.work_email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={tAdmin('fields.work_email_placeholder')} className="h-8 text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                {/* Work Phone */}
                <FormField
                  control={form.control}
                  name="work_phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-semibold">{tAdmin('fields.work_phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder={tAdmin('fields.work_phone_placeholder')} className="h-8 font-mono text-xs" {...field} />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {tCommon('actions.cancel')}
          </Button>
          <Button type="submit" form="employee-form" disabled={isPending}>
            {isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : tAdmin('actions.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
