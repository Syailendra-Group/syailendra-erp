/**
 * auth-schema.ts — Zod validation schemas for authentication forms
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver, withTurnstileSchema } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

export function getLoginSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  const baseSchema = z.object({
    email: z
      .string()
      .min(1, { message: msg('validation.emailRequired', 'Email is required') })
      .email({ message: msg('validation.emailInvalid', 'Invalid email address format') }),
    password: z.string().min(6, { message: msg('validation.passwordMin', 'Password must be at least 6 characters', { min: 6 }) }),
    rememberMe: z.boolean()
  })

  return withTurnstileSchema(baseSchema, t)
}

export const loginSchema = getLoginSchema()
export type LoginFormValues = z.infer<typeof loginSchema>
