/**
 * table-url.ts — Universal Bi-directional URL SearchParams Synchronizer
 * Syailendra Group ERP
 */

export interface ParsedTableParams {
  page: number
  perPage: number
  search: string
  sort: string
}

/**
 * Parses comma-separated URL string into clean string array
 */
export function parseArrayParam(param?: string | null): string[] {
  if (!param) return []
  return param
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Serializes string array into comma-separated URL parameter string
 */
export function serializeArrayParam(values?: string[] | null): string | undefined {
  if (!values || values.length === 0) return undefined
  const clean = values.map((s) => s.trim()).filter(Boolean)
  return clean.length > 0 ? clean.join(',') : undefined
}

/**
 * Builds updated URL search query string while cleaning default/empty values
 */
export function buildTableQueryString(currentParams: URLSearchParams, updates: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams(currentParams.toString())

  Object.entries(updates).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '' || (key === 'page' && val === 1) || (key === 'status' && val === 'all')) {
      params.delete(key)
    } else {
      params.set(key, String(val))
    }
  })

  return params.toString()
}

/**
 * Generates page numbers for pagination with intelligent ellipsis
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const maxVisiblePages = 5
  const rangeWithDots: (number | string)[] = []

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}
