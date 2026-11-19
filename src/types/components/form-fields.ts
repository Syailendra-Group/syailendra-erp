import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form'

export interface TextFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPathByValue<T, string | null | undefined>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  mono?: boolean
  maxLength?: number
  readOnly?: boolean
  type?: 'text' | 'email' | 'tel' | 'url'
  className?: string
}

export interface NumberFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPathByValue<T, number | null | undefined>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  step?: string
  min?: number
  max?: number
  className?: string
}

export interface TextareaFieldProps<T extends FieldValues> extends Omit<TextFieldProps<T>, 'type' | 'mono'> {
  rows?: number
}
