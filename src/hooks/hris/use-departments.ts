/**
 * use-departments.ts — TanStack Query Hooks for HR Departments
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getDepartmentsAction, saveDepartmentAction, toggleDepartmentStatusAction } from '@/actions/hris/department.action'

import type { DepartmentFormValues } from '@/schemas/hris/department-schema'
import type { DepartmentRecord } from '@/types/hris/department'

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: async (): Promise<DepartmentRecord[]> => {
      const res = await getDepartmentsAction()
      return res.departments
    }
  })
}

export function useSaveDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: DepartmentFormValues) => saveDepartmentAction(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    }
  })
}

export function useToggleDepartmentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => toggleDepartmentStatusAction(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all })
    }
  })
}
