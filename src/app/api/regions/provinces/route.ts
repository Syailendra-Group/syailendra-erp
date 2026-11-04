import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import type { CatalogApiResponse, CatalogProvince } from '@/types/data/indonesia-regions'

export const dynamic = 'force-static'
export const revalidate = 86400

export async function GET(): Promise<NextResponse<CatalogApiResponse<CatalogProvince[]>>> {
  try {
    const filePath = path.join(process.cwd(), 'src/data/indonesia-regions/catalog/provinces.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const provinces = JSON.parse(fileContent) as CatalogProvince[]

    return NextResponse.json(
      { success: true, data: provinces },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
        }
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load provinces'
    return NextResponse.json({ success: false, data: [], error: message }, { status: 500 })
  }
}
