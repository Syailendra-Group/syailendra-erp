import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import type { CatalogApiResponse, CatalogRegency } from '@/types/data/indonesia-regions'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse<CatalogApiResponse<CatalogRegency[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const provinceCode = searchParams.get('province_code')
    const search = searchParams.get('search')?.toLowerCase().trim()

    let regencies: CatalogRegency[] = []

    if (provinceCode) {
      const filePath = path.join(process.cwd(), `src/data/indonesia-regions/catalog/regencies/${provinceCode}.json`)
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8')
        regencies = JSON.parse(fileContent) as CatalogRegency[]
      } catch {
        regencies = []
      }
    } else {
      const allPath = path.join(process.cwd(), 'src/data/indonesia-regions/catalog/all-regencies.json')
      const fileContent = await fs.readFile(allPath, 'utf-8')
      regencies = JSON.parse(fileContent) as CatalogRegency[]
    }

    if (search) {
      regencies = regencies.filter((r) => r.name.toLowerCase().includes(search) || r.alias.toLowerCase().includes(search) || r.code.includes(search))
    }

    return NextResponse.json(
      { success: true, data: regencies },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
        }
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load regencies'
    return NextResponse.json({ success: false, data: [], error: message }, { status: 500 })
  }
}
