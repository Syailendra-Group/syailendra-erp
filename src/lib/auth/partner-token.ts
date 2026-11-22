/**
 * partner-token.ts — Stateless signed partner session token (HMAC-SHA256, Web Crypto)
 * Syailendra Group ERP
 *
 * Token format: <base64url(payload)>.<base64url(signature)>
 * Runtime-safe for Node.js and Edge (Next.js proxy).
 *
 * Audience isolation: the payload carries aud='partner' and a distinct claim shape,
 * so a staff token can never satisfy this verifier and vice versa.
 */

import type { PartnerRole, PartnerSession } from '@/types/scm/partner'

interface PartnerTokenPayload extends PartnerSession {
  aud: 'partner'
  v: 1
  iat: number
  exp: number
}

export const PARTNER_COOKIE_NAME = 'syailendra_partner_session'
export const PARTNER_TOKEN_VERSION = 1
export const PARTNER_TTL_SECONDS = 60 * 60 * 24 * 7

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

function isPartnerRole(value: string): value is PartnerRole {
  return value === 'farmer' || value === 'distiller'
}

function isValidPayload(payload: Partial<PartnerTokenPayload>): payload is PartnerTokenPayload {
  return (
    payload.aud === 'partner' &&
    payload.v === PARTNER_TOKEN_VERSION &&
    typeof payload.accessId === 'number' &&
    typeof payload.partnerId === 'number' &&
    typeof payload.partnerName === 'string' &&
    typeof payload.role === 'string' &&
    isPartnerRole(payload.role) &&
    typeof payload.companyId === 'number' &&
    typeof payload.mustChangePin === 'boolean' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number'
  )
}

export async function signPartnerToken(session: PartnerSession, secret: string, ttlSeconds: number = PARTNER_TTL_SECONDS): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000)
  const payload: PartnerTokenPayload = {
    ...session,
    aud: 'partner',
    v: PARTNER_TOKEN_VERSION,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds
  }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const key = await importHmacKey(secret)
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)))
  return `${body}.${toBase64Url(signature)}`
}

export async function verifyPartnerToken(token: string, secret: string): Promise<PartnerSession | null> {
  const parts = token.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null

  const [body, encodedSignature] = parts
  let signature: Uint8Array
  try {
    signature = fromBase64Url(encodedSignature)
  } catch {
    return null
  }

  const key = await importHmacKey(secret)
  const isSignatureValid = await crypto.subtle.verify('HMAC', key, signature as BufferSource, encoder.encode(body))
  if (!isSignatureValid) return null

  let payload: Partial<PartnerTokenPayload>
  try {
    payload = JSON.parse(decoder.decode(fromBase64Url(body))) as Partial<PartnerTokenPayload>
  } catch {
    return null
  }

  if (!isValidPayload(payload)) return null
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null

  return {
    accessId: payload.accessId,
    partnerId: payload.partnerId,
    partnerName: payload.partnerName,
    role: payload.role,
    companyId: payload.companyId,
    mustChangePin: payload.mustChangePin
  }
}
