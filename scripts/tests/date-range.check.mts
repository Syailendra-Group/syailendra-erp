/**
 * date-range.check.mts — runnable self-check for the Jakarta date-range helpers.
 * Run: node --experimental-strip-types scripts/tests/date-range.check.mts
 * Covers normal, boundary and failure paths. No credentials, no network.
 */
import assert from 'node:assert/strict'

import { isCalendarDate, jakartaDayEndUtc, jakartaDayStartUtc, normalizeDateRange } from '../../src/utils/date-range.ts'

function main(): void {
  // 1. WIB midnight is the previous UTC day at 17:00.
  assert.equal(jakartaDayStartUtc('2026-11-01'), '2026-10-31 17:00:00')
  // 2. WIB end-of-day is the same UTC day at 16:59:59.
  assert.equal(jakartaDayEndUtc('2026-11-01'), '2026-11-01 16:59:59')
  // 3. Month and year boundaries hold.
  assert.equal(jakartaDayStartUtc('2026-01-01'), '2025-12-31 17:00:00')
  assert.equal(jakartaDayEndUtc('2026-12-31'), '2026-12-31 16:59:59')
  // 4. Leap day is a real calendar day.
  assert.equal(isCalendarDate('2028-02-29'), true)
  assert.equal(jakartaDayStartUtc('2028-02-29'), '2028-02-28 17:00:00')

  // 5. Invalid input never becomes a domain value.
  assert.equal(isCalendarDate('2026-02-30'), false)
  assert.equal(isCalendarDate('2026-1-1'), false)
  assert.equal(isCalendarDate(''), false)
  assert.equal(jakartaDayStartUtc('2026-13-01'), null)
  assert.equal(jakartaDayEndUtc(undefined), null)

  // 6. Reversed ranges are normalized; invalid edges are dropped.
  assert.deepEqual(normalizeDateRange('2026-11-30', '2026-11-01'), { from: '2026-11-01', to: '2026-11-30' })
  assert.deepEqual(normalizeDateRange('2026-11-01', null), { from: '2026-11-01', to: null })
  assert.deepEqual(normalizeDateRange('nope', '2026-11-01'), { from: null, to: '2026-11-01' })

  console.log('date-range.check: OK (6 scenarios)')
}

main()
