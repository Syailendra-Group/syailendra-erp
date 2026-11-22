/**
 * auth-schema.ts — Zod validation schemas for the partner portal (mitra)
 * Syailendra Group ERP
 *
 * Every user-visible message is resolved through the next-intl translator
 * when one is provided, falling back to English (e.g. server actions).
 *
 * Two change-PIN schemas exist on purpose:
 * - getPartnerChangePinSchema: the FORM contract, including confirmPin.
 * - getPartnerChangePinPayloadSchema: the SERVER ACTION contract (oldPin +
 *   newPin only). The confirmation field is a UI concern; requiring it on the
 *   server rejected every valid change with invalid_input.
 */

import { z } from 'zod'

import { createSchemaMessageResolver, withTurnstileSchema } from '@/utils/schema-helper'

import type { SchemaTranslator } from '@/utils/schema-helper'

const PIN_REGEX = /^\d{6}$/

interface PinPair {
  oldPin: string
  newPin: string
}

function pinField(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)
  return z
    .string()
    .min(1, { message: msg('validation.pinRequired', 'PIN wajib diisi.') })
    .regex(PIN_REGEX, { message: msg('validation.pinFormat', 'PIN harus 6 digit angka.') })
}

/**
 * Applies the shared new-PIN strength rules to any schema that carries
 * oldPin/newPin, so the form and the server action cannot drift apart.
 */
function withPinStrength<S extends z.ZodType<PinPair>>(schema: S, t?: SchemaTranslator): S {
  const msg = createSchemaMessageResolver(t)
  const weakMessage = msg('validation.pinWeak', 'PIN terlalu lemah: hindari angka berulang, berurutan, atau PIN lama.')
  const isSequence = (pin: string, step: 1 | -1): boolean =>
    pin.split('').every((char, index, digits) => index === 0 || Number(char) - Number(digits[index - 1]) === step)

  return schema.superRefine((data: PinPair, ctx) => {
    if (data.newPin === data.oldPin) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPin'],
        message: msg('validation.pinSameAsOld', 'PIN baru tidak boleh sama dengan PIN lama.')
      })
    }
    if (/^(.)\1{5}$/.test(data.newPin) || isSequence(data.newPin, 1) || isSequence(data.newPin, -1)) {
      ctx.addIssue({ code: 'custom', path: ['newPin'], message: weakMessage })
    }
  }) as S
}

export function getPartnerLoginSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  const baseSchema = z.object({
    accessCode: z
      .string()
      .min(1, { message: msg('validation.accessCodeRequired', 'Kode mitra wajib diisi.') })
      .min(4, { message: msg('validation.accessCodeMin', 'Kode mitra minimal 4 karakter.') })
      .max(32, { message: msg('validation.accessCodeMax', 'Kode mitra maksimal 32 karakter.') }),
    pin: pinField(t)
  })

  return withTurnstileSchema(baseSchema, t)
}

export const partnerLoginSchema = getPartnerLoginSchema()
export type PartnerLoginFormValues = z.infer<typeof partnerLoginSchema>

export function getPartnerChangePinSchema(t?: SchemaTranslator) {
  const msg = createSchemaMessageResolver(t)

  return withPinStrength(
    z.object({
      oldPin: pinField(t),
      newPin: pinField(t),
      confirmPin: pinField(t)
    }),
    t
  ).refine((data) => data.confirmPin === data.newPin, {
    path: ['confirmPin'],
    message: msg('validation.pinConfirmMismatch', 'Konfirmasi PIN tidak cocok dengan PIN baru.')
  })
}

export const partnerChangePinSchema = getPartnerChangePinSchema()
export type PartnerChangePinFormValues = z.infer<typeof partnerChangePinSchema>

/** Server-action contract: the confirmation field never crosses the network boundary. */
export function getPartnerChangePinPayloadSchema(t?: SchemaTranslator) {
  return withPinStrength(
    z.object({
      oldPin: pinField(t),
      newPin: pinField(t)
    }),
    t
  )
}

export const partnerChangePinPayloadSchema = getPartnerChangePinPayloadSchema()
export type PartnerChangePinPayload = z.infer<typeof partnerChangePinPayloadSchema>
