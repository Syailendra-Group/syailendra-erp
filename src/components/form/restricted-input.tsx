'use client'

import { forwardRef } from 'react'

import { Input } from '@/components/ui/input'

export interface RestrictedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Force lowercase characters. Ignored when `uppercase` is also enabled. */
  lowercase?: boolean
  /** Force uppercase characters and take priority over `lowercase`. */
  uppercase?: boolean
  /** Strip every whitespace character from the value. */
  noSpaces?: boolean
}

/**
 * Reusable restricted text input.
 *
 * All transforms are opt-in (defaults are `false`) so the component stays safe on generic
 * text fields. Common combinations: machine codes (`uppercase` + `noSpaces`), usernames and
 * emails (`lowercase`), reference numbers (`noSpaces` only).
 */
export const RestrictedInput = forwardRef<HTMLInputElement, RestrictedInputProps>(
  ({ lowercase = false, uppercase = false, noSpaces = false, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let { value } = event.target

      if (uppercase) {
        value = value.toUpperCase()
      } else if (lowercase) {
        value = value.toLowerCase()
      }

      if (noSpaces) {
        value = value.replace(/\s+/g, '')
      }

      event.target.value = value
      onChange?.(event)
    }

    return <Input ref={ref} {...props} onChange={handleChange} />
  }
)

RestrictedInput.displayName = 'RestrictedInput'
