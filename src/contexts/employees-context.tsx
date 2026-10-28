"use client";

import * as React from "react";
import type { EmployeeRecord, DepartmentOption } from "@/features/admin/employees/actions";

export type EmployeesDialogType = "add" | "edit" | "archive" | null;

export interface EmployeesContextType {
  open: EmployeesDialogType;
  setOpen: (type: EmployeesDialogType) => void;
  currentRow: EmployeeRecord | null;
  setCurrentRow: (row: EmployeeRecord | null) => void;
  departments: DepartmentOption[];
  setDepartments: (depts: DepartmentOption[]) => void;
  refreshData: () => void;
}

const EmployeesContext = React.createContext<EmployeesContextType | null>(null);

export interface EmployeesProviderProps {
  children: React.ReactNode;
  refreshData: () => void;
  initialDepartments?: DepartmentOption[];
}

export function EmployeesProvider({
  children,
  refreshData,
  initialDepartments = [],
}: EmployeesProviderProps): React.ReactElement {
  const [open, setOpen] = React.useState<EmployeesDialogType>(null);
  const [currentRow, setCurrentRow] = React.useState<EmployeeRecord | null>(null);
  const [departments, setDepartments] = React.useState<DepartmentOption[]>(initialDepartments);

  return (
    <EmployeesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        departments,
        setDepartments,
        refreshData,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
}

export function useEmployees(): EmployeesContextType {
  const ctx = React.useContext(EmployeesContext);
  if (!ctx) {
    throw new Error("useEmployees must be used within an EmployeesProvider");
  }
  return ctx;
}
