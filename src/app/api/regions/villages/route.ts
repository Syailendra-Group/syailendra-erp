import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import type { CatalogApiResponse, CatalogVillage } from '@/types/data/indonesia-regions'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse<CatalogApiResponse<CatalogVillage[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const districtCode = searchParams.get('district_code')
    const search = searchParams.get('search')?.toLowerCase().trim()

    if (!districtCode) {
      return NextResponse.json({ success: false, data: [], error: 'district_code query parameter is required' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), `src/data/indonesia-regions/catalog/villages/${districtCode}.json`)
    let villages: CatalogVillage[] = []

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      villages = JSON.parse(fileContent) as CatalogVillage[]
    } catch {
      villages = []
    }

    if (search) {
      villages = villages.filter((v) => v.name.toLowerCase().includes(search) || v.alias.toLowerCase().includes(search) || v.code.includes(search))
    }

    return NextResponse.json(
      { success: true, data: villages },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
        }
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load villages'
    return NextResponse.json({ success: false, data: [], error: message }, { status: 500 })
  }
}
