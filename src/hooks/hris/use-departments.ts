/**
 * use-departments.ts — TanStack Query Hooks for HR Departments
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDepartmentsAction,
  getDepartmentsPaginatedAction,
  saveDepartmentAction,
  toggleDepartmentStatusAction
} from '@/actions/hris/department.action'

import type { DepartmentFormValues } from '@/schemas/hris/department-schema'
import type { FetchDepartmentsPaginatedParams } from '@/services/odoo/hris/department.service'

export const departmentQueryKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentQueryKeys.all, 'list'] as const,
  list: (params: FetchDepartmentsPaginatedParams) => [...departmentQueryKeys.lists(), params] as const
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: departmentQueryKeys.all,
    queryFn: async () => {
      const res = await getDepartmentsAction()
      if (res.error) throw new Error(res.error)
      return res.departments
    },
    staleTime: 1000 * 60 * 5
  })
}

export function useDepartmentsPaginatedQuery(params: FetchDepartmentsPaginatedParams) {
  return useQuery({
    queryKey: departmentQueryKeys.list(params),
    queryFn: async () => {
      return await getDepartmentsPaginatedAction(params)
    },
    staleTime: 1000 * 30
  })
}

export function useSaveDepartmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: DepartmentFormValues) => {
      return await saveDepartmentAction(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all })
    }
  })
}

export function useToggleDepartmentStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await toggleDepartmentStatusAction(id, active)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all })
    }
  })
}
