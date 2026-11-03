/**
 * select.ts — Centralized Types for SelectForm & Combobox Component
 * Syailendra Group ERP
 */

import type { ComponentType } from 'react'

export interface SelectOption<T extends string = string> {
  label: string
  value: T
  badge?: string
  description?: string
  disabled?: boolean
  image?: string
  icon?: ComponentType<{ className?: string }>
}

export type SelectOptionItem<T extends string = string> = SelectOption<T>

export interface BaseSelectFormProps<T extends string = string> {
  items: SelectOption<T>[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
  popoverWidth?: string
  clearable?: boolean
  addNewAction?: boolean
  addNewHref?: string
  addNewLabel?: string
  onAddNewClick?: () => void
  onAddNew?: () => void
  onSearchChange?: (search: string) => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export interface SingleSelectFormProps<T extends string = string> extends BaseSelectFormProps<T> {
  multiple?: false
  value?: T
  defaultValue?: T
  onValueChange?: (val: T) => void
}

export interface MultiSelectFormProps<T extends string = string> extends BaseSelectFormProps<T> {
  multiple: true
  value?: T[]
  defaultValue?: T[]
  onValueChange?: (val: T[]) => void
}

export type SelectFormProps<T extends string = string> = SingleSelectFormProps<T> | MultiSelectFormProps<T>
