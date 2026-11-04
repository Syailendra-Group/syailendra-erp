/**
 * use-employees.ts — TanStack Query Hooks for HR Employees
 * Syailendra Group ERP
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDepartmentOptionsAction,
  getEmployeesAction,
  getEmployeesPaginatedAction,
  saveEmployeeAction,
  toggleEmployeeStatusAction
} from '@/actions/hris/employee.action'

import type { EmployeeFormValues } from '@/schemas/hris/employee-schema'
import type { FetchEmployeesPaginatedParams } from '@/services/odoo/hris/employee.service'

export const employeeQueryKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeQueryKeys.all, 'list'] as const,
  list: (params: FetchEmployeesPaginatedParams) => [...employeeQueryKeys.lists(), params] as const,
  departments: () => [...employeeQueryKeys.all, 'departments'] as const
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: employeeQueryKeys.all,
    queryFn: async () => {
      const res = await getEmployeesAction()
      if (res.error) throw new Error(res.error)
      return res.employees
    },
    staleTime: 1000 * 60 * 5
  })
}

export function useEmployeesPaginatedQuery(params: FetchEmployeesPaginatedParams) {
  return useQuery({
    queryKey: employeeQueryKeys.list(params),
    queryFn: async () => {
      return await getEmployeesPaginatedAction(params)
    },
    staleTime: 1000 * 30
  })
}

export function useDepartmentOptionsQuery() {
  return useQuery({
    queryKey: employeeQueryKeys.departments(),
    queryFn: async () => {
      return await getDepartmentOptionsAction()
    },
    staleTime: 1000 * 60 * 10
  })
}

export function useSaveEmployeeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      return await saveEmployeeAction(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
    }
  })
}

export function useToggleEmployeeStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      return await toggleEmployeeStatusAction(id, active)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all })
    }
  })
}
