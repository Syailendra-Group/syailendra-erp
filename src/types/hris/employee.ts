export interface EmployeeRecord {
  id: number
  name: string
  work_email: string
  work_phone: string
  job_title: string
  department_id: [number, string] | false
  active: boolean
}

export interface DepartmentOption {
  id: number
  name: string
}
