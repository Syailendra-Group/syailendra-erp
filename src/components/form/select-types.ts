import type { ComponentType } from 'react'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  description?: string
  image?: string
  icon?: ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface BaseSelectFormProps<T extends string = string> {
  items: SelectOption<T>[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  popoverWidth?: string
  addNewAction?: boolean
  addNewHref?: string
  addNewLabel?: string
  onAddNewClick?: () => void
}

export interface SingleSelectFormProps<T extends string = string> extends BaseSelectFormProps<T> {
  multiple?: false
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

export interface MultiSelectFormProps<T extends string = string> extends BaseSelectFormProps<T> {
  multiple: true
  value?: T[]
  defaultValue?: T[]
  onValueChange?: (value: T[]) => void
}

export type SelectFormProps<T extends string = string> = SingleSelectFormProps<T> | MultiSelectFormProps<T>
