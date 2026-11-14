/**
 * website-schema.ts — Zod validation schema for Global Website & Appearance Configuration
 * Syailendra Group ERP
 */

import { z } from 'zod'

import { createSchemaMessageResolver } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

export function createSiteConfigSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return z.object({
    site_name: z
      .string()
      .min(2, { message: msg('validation.siteNameMin', 'Website name must be at least 2 characters') })
      .max(60, { message: msg('validation.siteNameMax', 'Website name cannot exceed 60 characters') }),
    company_name: z
      .string()
      .min(2, { message: msg('validation.companyNameMin', 'Business name must be at least 2 characters') })
      .max(120, { message: msg('validation.companyNameMax', 'Business name cannot exceed 120 characters') }),
    site_descriptor: z.string().max(120),
    login_tagline: z.string().max(200),
    login_card_title: z.string().max(100),
    login_card_description: z.string().max(500),
    footer_backbone: z.string().max(200),
    copyright_text: z.string().max(200),
    logo_light: z.string().nullable().optional(),
    logo_dark: z.string().nullable().optional(),
    logo_monogram: z.string().nullable().optional(),
    primary_light: z.string().regex(HEX_COLOR_REGEX, {
      message: msg('validation.hexInvalid', 'Must be a valid hex color code (e.g. #004E52)')
    }),
    primary_dark: z.string().regex(HEX_COLOR_REGEX, {
      message: msg('validation.hexInvalid', 'Must be a valid hex color code (e.g. #008187)')
    }),
    bg_light: z.string().regex(HEX_COLOR_REGEX, {
      message: msg('validation.hexInvalid', 'Must be a valid hex color code (e.g. #FFFDEE)')
    }),
    bg_dark: z.string().regex(HEX_COLOR_REGEX, {
      message: msg('validation.hexInvalid', 'Must be a valid hex color code (e.g. #181C20)')
    }),
    accent_gold: z.string().regex(HEX_COLOR_REGEX, {
      message: msg('validation.hexInvalid', 'Must be a valid hex color code (e.g. #E8AE1E)')
    })
  })
}

export const siteConfigSchema = createSiteConfigSchema()
export type SiteConfigFormValues = z.infer<typeof siteConfigSchema>
