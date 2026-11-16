/**
 * token.ts — Stateless signed session token (HMAC-SHA256, Web Crypto)
 * Syailendra Group ERP
 *
 * Token format: <base64url(payload)>.<base64url(signature)>
 * Runtime-safe for Node.js and Edge (Next.js proxy).
 */

export interface SessionClaims {
  uid: number
  name: string
  email: string
  companyId: number
  companyName: string
  groups: number[]
  isAdmin: boolean
}

interface SessionTokenPayload extends SessionClaims {
  v: 2
  iat: number
  exp: number
}

export const SESSION_COOKIE_NAME = 'syailendra_session'
export const SESSION_TOKEN_VERSION = 2
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

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

function isValidPayload(payload: Partial<SessionTokenPayload>): payload is SessionTokenPayload {
  return (
    payload.v === SESSION_TOKEN_VERSION &&
    typeof payload.uid === 'number' &&
    typeof payload.name === 'string' &&
    typeof payload.email === 'string' &&
    typeof payload.companyId === 'number' &&
    typeof payload.companyName === 'string' &&
    Array.isArray(payload.groups) &&
    payload.groups.every((group) => typeof group === 'number') &&
    typeof payload.isAdmin === 'boolean' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number'
  )
}

export async function signSessionToken(claims: SessionClaims, secret: string, ttlSeconds: number = SESSION_TTL_SECONDS): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000)
  const payload: SessionTokenPayload = {
    ...claims,
    v: SESSION_TOKEN_VERSION,
    iat: issuedAt,
    exp: issuedAt + ttlSeconds
  }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const key = await importHmacKey(secret)
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)))
  return `${body}.${toBase64Url(signature)}`
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionClaims | null> {
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

  let payload: Partial<SessionTokenPayload>
  try {
    payload = JSON.parse(decoder.decode(fromBase64Url(body))) as Partial<SessionTokenPayload>
  } catch {
    return null
  }

  if (!isValidPayload(payload)) return null
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null

  return {
    uid: payload.uid,
    name: payload.name,
    email: payload.email,
    companyId: payload.companyId,
    companyName: payload.companyName,
    groups: payload.groups,
    isAdmin: payload.isAdmin
  }
}
