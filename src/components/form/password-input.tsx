'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, 'type'> {
  showToggle?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ className, disabled, showToggle = true, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState<boolean>(false)

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn(showToggle ? 'pr-10' : '', className)}
        ref={ref}
        disabled={disabled}
        {...props}
      />
      {showToggle && (
        <Button
          type="button"
          variant="ghost"
          tabIndex={-1}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </Button>
      )}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'
