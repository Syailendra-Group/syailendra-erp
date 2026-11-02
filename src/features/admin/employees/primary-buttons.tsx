'use client'

import { type ReactElement } from 'react'
import { UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useEmployees } from '@/contexts/hris/employee.context'

export function EmployeesPrimaryButtons(): ReactElement {
  const tAdmin = useTranslations('admin.employees')
  const { setOpen, setCurrentRow } = useEmployees()

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => {
          setCurrentRow(null)
          setOpen('add')
        }}
      >
        <UserPlus className="h-4 w-4" />
        <span>{tAdmin('actions.add')}</span>
      </Button>
    </div>
  )
}
