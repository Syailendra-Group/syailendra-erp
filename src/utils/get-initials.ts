/**
 * get-initials.ts — Extract clean capital initials & resolve media URLs
 * Syailendra Group ERP
 */

/**
 * Extract up to 2 uppercase initials from a name or corporate title.
 * Automatically strips common corporate prefixes like "PT " or "CV " to extract true entity initials.
 *
 * @param name Entity name or full person name (e.g. "SYAILENDRA GROUP" -> "SG", "PT Syailendra Bumi Investama" -> "SB")
 * @returns 1 or 2 uppercase letters (fallback: "SG")
 */
export function getInitials(name?: string | null): string {
  if (!name) return 'SG'
  const trimmed = name.trim()
  if (!trimmed) return 'SG'

  // If user passed a short code directly (e.g. "SG", "PT SBI", "SBI", "SPBA")
  if (trimmed.length <= 4 && !trimmed.includes(' ')) {
    return trimmed.toUpperCase().slice(0, 2)
  }

  // Strip leading company type indicators if present
  let cleanName = trimmed
  if (/^(PT|CV|UD|TBK|NV|FIRMA)\b/i.test(cleanName)) {
    cleanName = cleanName.replace(/^(PT|CV|UD|TBK|NV|FIRMA)\b\.?\s*/i, '').trim()
  }

  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'SG'
  if (parts.length === 1) {
    const word = parts[0]
    return (word ? word.slice(0, 2) : 'SG').toUpperCase()
  }

  const first = parts[0] ? parts[0][0] : 'S'
  const second = parts[1] ? parts[1][0] : 'G'
  return `${first}${second}`.toUpperCase()
}

/**
 * Resolves an image source into a browser-renderable URI.
 * Handles base64 payloads from Odoo (adding data URI prefix if needed), local public paths, and external URLs.
 */
export function resolveImageSrc(src?: string | null): string | null {
  if (!src) return null
  const trimmed = src.trim()
  if (!trimmed) return null

  // If already a valid absolute URL, blob URL, or data URI
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed
  }

  // Otherwise, treat as raw base64 string from Odoo
  return `data:image/png;base64,${trimmed}`
}
