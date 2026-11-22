/**
 * media-policy.check.mts — runnable self-check for the upload policy helpers.
 * Run: node --experimental-strip-types scripts/tests/media-policy.check.mts
 * No credentials, no network, no filesystem writes.
 */
import assert from 'node:assert/strict'

import {
  buildStorageKey,
  detectMimetype,
  extensionFor,
  isMediaEntity,
  isMediaRole,
  isSafeStorageKey,
  KIND_LIMITS,
  KIND_QUOTAS,
  kindForMimetype
} from '../../src/lib/storage/media-policy.ts'

function bytes(values: number[]): Uint8Array {
  return new Uint8Array(values)
}

function ascii(text: string): number[] {
  return Array.from(text, (char) => char.charCodeAt(0))
}

function main(): void {
  // 1. Magic-byte sniffing accepts the four supported families and reports its MIME.
  assert.equal(detectMimetype(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png')
  assert.equal(detectMimetype(bytes([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg')
  assert.equal(detectMimetype(bytes([...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')])), 'image/webp')
  assert.equal(detectMimetype(bytes([...ascii('%PDF-1.7')])), 'application/pdf')
  // 2. MP4 is detected from the ISO base media `ftyp` box, not from the extension.
  assert.equal(detectMimetype(bytes([0, 0, 0, 0x18, ...ascii('ftypisom'), 0, 0, 0, 0])), 'video/mp4')
  assert.equal(detectMimetype(bytes([0, 0, 0, 0x18, ...ascii('ftypqt  '), 0, 0, 0, 0])), 'video/quicktime')
  // 3. WebM/Matroska EBML header.
  assert.equal(detectMimetype(bytes([0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00])), 'video/webm')
  // 4. Anything else is refused — the caller maps null to MEDIA_TYPE_INVALID.
  assert.equal(detectMimetype(bytes([0x4d, 0x5a, 0x90, 0x00])), null)
  assert.equal(detectMimetype(bytes([])), null)

  // 5. Kind mapping drives the size cap; a Linux executable maps to no kind at all.
  assert.equal(kindForMimetype('image/webp'), 'image')
  assert.equal(kindForMimetype('application/pdf'), 'document')
  assert.equal(kindForMimetype('video/webm'), 'video')
  assert.equal(kindForMimetype('video/quicktime'), null)
  assert.equal(KIND_LIMITS.image, 5 * 1024 * 1024)
  assert.equal(KIND_LIMITS.document, 10 * 1024 * 1024)
  assert.equal(KIND_LIMITS.video, 50 * 1024 * 1024)
  // 6. Quotas are the per-entity caps enforced by the route.
  assert.deepEqual(KIND_QUOTAS, { image: 12, document: 12, video: 6 })

  // 7. Keys are generated server-side: allowlisted model, integer id, uuid filename.
  const key = buildStorageKey('res.partner', 42, 'video/mp4')
  assert.match(key, /^media\/res\.partner\/42\/[0-9a-f-]{36}\.mp4$/)
  assert.equal(isSafeStorageKey(key), true)
  // 8. The key builder refuses anything that could escape the media prefix.
  assert.throws(() => buildStorageKey('res.users', 42, 'image/png'), /MEDIA_KEY_INVALID/)
  assert.throws(() => buildStorageKey('res.partner', 0, 'image/png'), /MEDIA_KEY_INVALID/)
  assert.throws(() => buildStorageKey('res.partner', 42, 'application/x-php'), /MEDIA_KEY_INVALID/)
  // 9. Read-back keys must stay relative and inside media/.
  for (const bad of ['/etc/passwd', 'media/../x.jpg', 'https://example.com/a.jpg', 'media/', 'media\\x.jpg']) {
    assert.equal(isSafeStorageKey(bad), false, bad)
  }

  // 10. Extensions come from the sniffed MIME, never from the client filename.
  assert.equal(extensionFor('video/mp4'), 'mp4')
  assert.equal(extensionFor('image/jpeg'), 'jpg')
  assert.equal(extensionFor('application/zip'), null)

  // 11. Entity/role allowlists are exact membership tests.
  assert.equal(isMediaEntity('syailendra.farm'), true)
  assert.equal(isMediaEntity('res.users'), false)
  assert.equal(isMediaRole('certificate'), true)
  assert.equal(isMediaRole('admin'), false)

  console.log('media-policy.check: 11 groups OK')
}

main()
