'use client'

import { idb } from './idb'

import type { OutboxRecord } from './idb'

export type SubmissionPayload = {
  kind: string
  payload: Record<string, string | number>
  lat?: number
  lon?: number
  photoFile?: File | null
}

const MAX_ATTEMPTS = 5
const BASE_BACKOFF_MS = 1000

let current: Promise<{ sent: number; failed: number }> | null = null

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitForOnline(): Promise<void> {
  if (typeof navigator === 'undefined' || navigator.onLine) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    const onOnline = () => {
      window.removeEventListener('online', onOnline)
      resolve()
    }
    window.addEventListener('online', onOnline, { once: true })
  })
}

function backoffMs(attempts: number): number {
  return BASE_BACKOFF_MS * Math.pow(2, attempts - 1)
}

/**
 * Build the multipart body sent to the submission endpoint.
 * Route contract (requested — does not exist yet):
 * POST /api/mitra/submissions  multipart/form-data
 *   fields: kind, payload (JSON string), lat?, lon?, photo (File)
 */
export function buildSubmissionBody(payload: SubmissionPayload): FormData {
  const body = new FormData()
  body.append('kind', payload.kind)
  body.append('payload', JSON.stringify(payload.payload))
  if (payload.lat != null) {
    body.append('lat', String(payload.lat))
  }
  if (payload.lon != null) {
    body.append('lon', String(payload.lon))
  }
  if (payload.photoFile) {
    body.append('photo', payload.photoFile)
  }
  return body
}

async function sendRecord(record: OutboxRecord): Promise<boolean> {
  const updatedAttempts = record.attempts + 1
  try {
    const payload = record.payload as SubmissionPayload
    const response = await fetch(record.route, {
      method: 'POST',
      body: buildSubmissionBody(payload),
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    await idb.outboxUpdate(record.id, { attempts: updatedAttempts, lastError: null })
    return true
  } catch (error) {
    await idb.outboxUpdate(record.id, {
      attempts: updatedAttempts,
      lastError: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

async function pump(): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  while (true) {
    const records = await idb.outboxGetAll()
    const record = records.find((r) => r.attempts < MAX_ATTEMPTS)
    if (!record) {
      break
    }
    // Re-fetch so a record already sent by a direct submit is not duplicated.
    const fresh = await idb.outboxGet(record.id)
    if (!fresh || fresh.attempts >= MAX_ATTEMPTS) {
      continue
    }
    await waitForOnline()
    const ok = await sendRecord(fresh)
    if (ok) {
      sent++
    } else {
      failed++
      await sleep(backoffMs(fresh.attempts))
    }
  }
  return { sent, failed }
}

/**
 * Process the outbox queue: one record at a time, exponential backoff
 * (2^(attempts-1) * 1000 ms), maximum 5 attempts per record. Waits for the
 * browser to come back online when offline. Only one pump runs at a time;
 * concurrent calls return the same promise.
 */
export async function processOutbox(): Promise<{ sent: number; failed: number }> {
  if (current) {
    return current
  }
  current = pump().finally(() => {
    current = null
  })
  return current
}
