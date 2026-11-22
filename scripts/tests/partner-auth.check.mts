/**
 * partner-auth.check.mts — runnable self-check for the partner auth foundation.
 * Run: node --experimental-strip-types scripts/tests/partner-auth.check.mts
 * Covers normal, boundary and failure paths. No credentials, no network.
 */
import assert from 'node:assert/strict'

import {
  PARTNER_TTL_SECONDS,
  signPartnerToken,
  verifyPartnerToken
} from '../../src/lib/auth/partner-token.ts'
import { checkRateLimit, clearRateLimits, resetRateLimit } from '../../src/lib/rate-limit.ts'

import type { PartnerSession } from '../../src/types/scm/partner.ts'

const SECRET = 'x'.repeat(48)
const OTHER_SECRET = 'y'.repeat(48)

const session: PartnerSession = {
  accessId: 7,
  partnerId: 42,
  partnerName: 'Petani Uji',
  role: 'farmer',
  companyId: 2,
  mustChangePin: true
}

async function main(): Promise<void> {
  // 1. Normal path: sign then verify returns the same claims.
  const token = await signPartnerToken(session, SECRET)
  const verified = await verifyPartnerToken(token, SECRET)
  assert.deepEqual(verified, session, 'roundtrip must preserve claims')

  // 2. Failure: a different secret must not verify.
  assert.equal(await verifyPartnerToken(token, OTHER_SECRET), null, 'wrong secret rejected')

  // 3. Failure: tampered signature must not verify.
  const [body, sig] = token.split('.')
  const flipped = `${body}.${sig.slice(0, -2)}${sig.endsWith('AA') ? 'BB' : 'AA'}`
  assert.equal(await verifyPartnerToken(flipped, SECRET), null, 'tampered signature rejected')

  // 4. Failure: malformed token shapes.
  assert.equal(await verifyPartnerToken('garbage', SECRET), null)
  assert.equal(await verifyPartnerToken(`${body}.`, SECRET), null)

  // 5. Boundary: an expired token is rejected.
  const expired = await signPartnerToken(session, SECRET, -1)
  assert.equal(await verifyPartnerToken(expired, SECRET), null, 'expired token rejected')

  // 6. Boundary: a token expiring exactly now is rejected (exp <= now).
  const zeroTtl = await signPartnerToken(session, SECRET, 0)
  assert.equal(await verifyPartnerToken(zeroTtl, SECRET), null, 'zero ttl rejected')

  // 7. Isolation: a staff-shaped payload signed with the partner secret is rejected.
  const staffPayload = {
    uid: 2,
    name: 'Staff',
    email: 'staff@example.com',
    companyId: 2,
    companyName: 'PT SBI',
    groups: [1],
    isAdmin: true,
    v: 2,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  }
  const staffBody = Buffer.from(JSON.stringify(staffPayload)).toString('base64url')
  const { createHmac } = await import('node:crypto')
  const staffSig = createHmac('sha256', SECRET).update(staffBody).digest('base64url')
  assert.equal(
    await verifyPartnerToken(`${staffBody}.${staffSig}`, SECRET),
    null,
    'staff payload must not satisfy the partner verifier'
  )

  // 8. TTL default is seven days.
  assert.equal(PARTNER_TTL_SECONDS, 604800)

  // 9. Rate limit: allows up to the limit, then blocks with a retry hint.
  clearRateLimits()
  const options = { limit: 3, windowMs: 60_000 }
  assert.equal(checkRateLimit('ip:1.2.3.4', options).allowed, true)
  assert.equal(checkRateLimit('ip:1.2.3.4', options).allowed, true)
  const third = checkRateLimit('ip:1.2.3.4', options)
  assert.equal(third.allowed, true)
  assert.equal(third.remaining, 0)
  const fourth = checkRateLimit('ip:1.2.3.4', options)
  assert.equal(fourth.allowed, false, 'fourth attempt blocked')
  assert.ok(fourth.retryAfterSeconds > 0, 'retry hint present')

  // 10. Keys are independent.
  assert.equal(checkRateLimit('code:FMR-JTG-001', options).allowed, true)

  // 11. Reset clears the penalty for honest users.
  resetRateLimit('ip:1.2.3.4')
  assert.equal(checkRateLimit('ip:1.2.3.4', options).allowed, true)

  // 12. Boundary: a zero-length window never blocks.
  assert.equal(checkRateLimit('ip:5.6.7.8', { limit: 1, windowMs: 0 }).allowed, true)
  assert.equal(checkRateLimit('ip:5.6.7.8', { limit: 1, windowMs: 0 }).allowed, true)

  clearRateLimits()
  console.log('PARTNER_AUTH_CHECK_OK: 12 assertions passed')
}

main().catch((error: Error) => {
  console.error('PARTNER_AUTH_CHECK_FAILED:', error.message)
  process.exit(1)
})
