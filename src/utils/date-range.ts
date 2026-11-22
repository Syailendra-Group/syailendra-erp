/**
 * date-range.ts — Jakarta calendar-day boundaries for Odoo datetime domains.
 * Syailendra Group ERP
 *
 * Operators pick calendar days in WIB (UTC+7) while Odoo stores naive UTC
 * datetimes, so a raw `YYYY-MM-DD` comparison drifts by seven hours at both
 * edges of the range. These helpers convert an inclusive WIB day (or range)
 * into the UTC strings Odoo expects.
 */

export const JAKARTA_UTC_OFFSET_MINUTES = 7 * 60

const DAY_MS = 86_400_000
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** True only for a real calendar day written as `YYYY-MM-DD`. */
export function isCalendarDate(value: string | null | undefined): value is string {
  if (!value || !DATE_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const probe = new Date(Date.UTC(year, month - 1, day))
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toOdooUtc(timestampMs: number): string {
  const date = new Date(timestampMs)
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
}

function dayStartMs(date: string): number | null {
  if (!isCalendarDate(date)) return null
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) - JAKARTA_UTC_OFFSET_MINUTES * 60_000
}

/** WIB 00:00:00 of the given calendar day, expressed as an Odoo UTC datetime. */
export function jakartaDayStartUtc(date: string | null | undefined): string | null {
  if (!date) return null
  const start = dayStartMs(date)
  return start === null ? null : toOdooUtc(start)
}

/** WIB 23:59:59 of the given calendar day, expressed as an Odoo UTC datetime. */
export function jakartaDayEndUtc(date: string | null | undefined): string | null {
  if (!date) return null
  const start = dayStartMs(date)
  return start === null ? null : toOdooUtc(start + DAY_MS - 1000)
}

/**
 * Keep an inclusive range well-formed: invalid edges are dropped and a reversed
 * pick (end before start) is swapped so the filter still returns the days the
 * operator visually selected.
 */
export function normalizeDateRange(from?: string | null, to?: string | null): { from: string | null; to: string | null } {
  const safeFrom = isCalendarDate(from) ? from : null
  const safeTo = isCalendarDate(to) ? to : null

  if (safeFrom && safeTo && safeFrom > safeTo) {
    return { from: safeTo, to: safeFrom }
  }

  return { from: safeFrom, to: safeTo }
}
