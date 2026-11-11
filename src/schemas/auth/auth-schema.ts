/**
 * auth-schema.ts — Zod validation schemas for authentication forms
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils'

import type { SchemaTranslator } from '@/utils'

export function getLoginSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    email: z
      .string()
      .min(1, { message: msg('validation.emailRequired', 'Email is required') })
      .email({ message: msg('validation.emailInvalid', 'Invalid email address format') }),
    password: z.string().min(6, { message: msg('validation.passwordMin', 'Password must be at least 6 characters', { min: 6 }) }),
    rememberMe: z.boolean(),
    turnstileToken: z.string().min(1, { message: msg('validation.turnstileRequired', 'Please complete the security verification') })
  })
}

export const loginSchema = getLoginSchema()
export type LoginFormValues = z.infer<typeof loginSchema>
