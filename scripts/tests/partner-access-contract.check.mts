/**
 * partner-access-contract.check.mts — Offline backend-response and captcha guards.
 * Run with Node --experimental-strip-types. No network, credentials, or writes.
 */
import assert from 'node:assert/strict'

import { getPartnerTurnstileStatus } from '../../src/lib/auth/partner-turnstile.ts'
import { parseAccessRecord } from '../../src/services/odoo/partner/partner-access-mapper.ts'

const valid = {
  ok: true,
  access_id: 7,
  partner_id: 42,
  partner_name: 'Synthetic Test Partner',
  role: 'distiller',
  company_id: 2,
  must_change_pin: true
}

assert.deepEqual(parseAccessRecord(valid), {
  accessId: 7,
  partnerId: 42,
  partnerName: 'Synthetic Test Partner',
  role: 'distiller',
  companyId: 2,
  mustChangePin: true
})
assert.equal(parseAccessRecord({ ok: true }), null, 'incomplete identity must fail')
assert.equal(parseAccessRecord({ ...valid, access_id: 0 }), null, 'zero access id must fail')
assert.equal(parseAccessRecord({ ...valid, partner_id: -1 }), null, 'negative partner id must fail')
assert.equal(parseAccessRecord({ ...valid, company_id: 1.5 }), null, 'noninteger company id must fail')
assert.equal(parseAccessRecord({ ...valid, partner_name: '   ' }), null, 'blank identity must fail')
assert.equal(parseAccessRecord({ ...valid, role: 'supplier' }), null, 'unknown role must fail')
assert.equal(parseAccessRecord({ ...valid, must_change_pin: undefined }), null, 'missing PIN flag must fail')
assert.equal(parseAccessRecord({ ...valid, access_id: '7' }), null, 'string identity must fail')
assert.equal(parseAccessRecord({ ok: true, accessId: 7, partnerId: 42 }), null, 'camelCase response must not create a session')

const saved = Object.fromEntries(
  ['TURNSTILE_SECRET_KEY', 'TURNSTILE_ALLOW_TEST_KEYS', 'APP_ENV', 'NEXT_PUBLIC_APP_URL', 'NODE_ENV'].map((key) => [key, process.env[key]])
)
function setNodeEnv(value: string): void {
  Object.defineProperty(process.env, 'NODE_ENV', { value, configurable: true, writable: true, enumerable: true })
}
const restore = (): void => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) Reflect.deleteProperty(process.env, key)
    else process.env[key] = value
  }
}
try {
  const testSecret = '1x' + '0'.repeat(30) + 'AA'
  for (const nodeEnv of ['development', 'test', 'production']) {
    setNodeEnv(nodeEnv)
    for (const key of ['TURNSTILE_SECRET_KEY', 'TURNSTILE_ALLOW_TEST_KEYS', 'APP_ENV', 'NEXT_PUBLIC_APP_URL'])
      Reflect.deleteProperty(process.env, key)
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: false, reason: 'missing' })

    // Test keys need the full explicit test-deployment marker, even in a production build.
    process.env.TURNSTILE_SECRET_KEY = testSecret
    process.env.TURNSTILE_ALLOW_TEST_KEYS = 'true'
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: false, reason: 'test_key' }, 'flag alone must not unlock')
    process.env.APP_ENV = 'test'
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: false, reason: 'test_key' }, 'test env without loopback URL must not unlock')
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.syailendra.group'
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: false, reason: 'test_key' }, 'public URL must never accept test keys')
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3301'
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: true, reason: 'ok' }, 'declared local test deployment accepts test keys')
    process.env.APP_ENV = 'production'
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: false, reason: 'test_key' }, 'APP_ENV=production must reject test keys')
    process.env.APP_ENV = 'test'
    process.env.TURNSTILE_ALLOW_TEST_KEYS = 'false'
    assert.deepEqual(getPartnerTurnstileStatus(), { configured: false, reason: 'test_key' }, 'missing opt-in must reject test keys')
  }
  setNodeEnv('production')
  Reflect.deleteProperty(process.env, 'APP_ENV')
  Reflect.deleteProperty(process.env, 'TURNSTILE_ALLOW_TEST_KEYS')
  process.env.NEXT_PUBLIC_APP_URL = 'https://app.syailendra.group'
  process.env.TURNSTILE_SECRET_KEY = 'synthetic-non-provider-secret'
  assert.deepEqual(getPartnerTurnstileStatus(), { configured: true, reason: 'ok' }, 'real secret passes in production')
} finally {
  restore()
}
console.log('PARTNER_ACCESS_CONTRACT_CHECK_OK: identity mapping and production captcha guard passed')
