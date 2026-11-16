/**
 * test-session-token.mjs — runnable security check for signed session tokens
 * Run: node --experimental-strip-types scripts/test-session-token.mjs
 */
import assert from 'node:assert/strict'

import { signSessionToken, verifySessionToken } from '../src/lib/auth/token.ts'

const secret = 'test-only-secret-value-with-more-than-32-characters'
const claims = {
  uid: 8,
  name: 'Demo Syailendra',
  email: 'demo@syailendra.group',
  companyId: 3,
  companyName: 'PT SYAILENDRA MAHAKARYA MENDUNIA',
  groups: [1, 2],
  isAdmin: false
}

const token = await signSessionToken(claims, secret)
const verified = await verifySessionToken(token, secret)
assert.equal(verified?.uid, 8)
assert.equal(verified?.companyId, 3)
assert.deepEqual(verified?.groups, [1, 2])

const [body, signature] = token.split('.')
assert.equal(await verifySessionToken(`${body}x.${signature}`, secret), null)
assert.equal(await verifySessionToken(`${body}.${signature.slice(0, -2)}`, secret), null)
assert.equal(await verifySessionToken(token, `${secret}-wrong`), null)

const expired = await signSessionToken(claims, secret, -1)
assert.equal(await verifySessionToken(expired, secret), null)

const legacy = Buffer.from(JSON.stringify(claims)).toString('base64')
assert.equal(await verifySessionToken(legacy, secret), null)
assert.equal(await verifySessionToken('not-a-token', secret), null)

console.log('session token tests: 8 passed')
