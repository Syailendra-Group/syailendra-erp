/**
 * use-employees.ts — TanStack Query Hooks for HR Employees
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getEmployeesAction, saveEmployeeAction, toggleEmployeeStatusAction } from '@/actions/hris/employee.action'

import type { EmployeeFormValues } from '@/schemas/hris/employee-schema'
import type { DepartmentOption, EmployeeRecord } from '@/types/hris/employee'

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: async (): Promise<{ employees: EmployeeRecord[]; departments: DepartmentOption[] }> => {
      return await getEmployeesAction()
    }
  })
}

export function useSaveEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: EmployeeFormValues) => saveEmployeeAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    }
  })
}

export function useToggleEmployeeStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleEmployeeStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
    }
  })
}
