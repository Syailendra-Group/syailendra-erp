/**
 * company-schema.ts — Zod validation schema for Multi-Entity Corporate Profiles & Dynamic Menus
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

export const MODULE_TABS_SCHEMA = z.enum(['ftm', 'hrm', 'scm', 'wms', 'crm', 'dcm', 'ai', 'imm', 'others'])

export function createCompanySchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    id: z.number().int().positive(),
    short_name: z
      .string()
      .min(2, { message: msg('validation.shortNameMin', 'Entity short code must be at least 2 characters') })
      .max(30, { message: msg('validation.shortNameMax', 'Entity short code cannot exceed 30 characters') }),
    name: z
      .string()
      .min(3, { message: msg('validation.nameMin', 'Legal company name must be at least 3 characters') })
      .max(120, { message: msg('validation.nameMax', 'Legal company name cannot exceed 120 characters') }),
    tagline: z.string().max(200),
    email: z.string().max(100),
    phone: z.string().max(50),
    mobile: z.string().max(50),
    website: z.string().max(200),
    street: z.string().max(300),
    city: z.string().max(100),
    zip: z.string().max(20),
    vat: z.string().max(50),
    logo_web: z.string().nullable().optional(),
    enabled_pillars: z.array(MODULE_TABS_SCHEMA)
  })
}

export const companySchema = createCompanySchema()
export type CompanyFormValues = z.infer<typeof companySchema>
