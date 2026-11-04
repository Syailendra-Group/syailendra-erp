import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

import type { CatalogApiResponse, CatalogDistrict } from '@/types/data/indonesia-regions'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse<CatalogApiResponse<CatalogDistrict[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const regencyCode = searchParams.get('regency_code')
    const search = searchParams.get('search')?.toLowerCase().trim()

    let districts: CatalogDistrict[] = []

    if (regencyCode) {
      const filePath = path.join(process.cwd(), `src/data/indonesia-regions/catalog/districts/${regencyCode}.json`)
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8')
        districts = JSON.parse(fileContent) as CatalogDistrict[]
      } catch {
        districts = []
      }
    } else {
      const allPath = path.join(process.cwd(), 'src/data/indonesia-regions/catalog/all-districts.json')
      const fileContent = await fs.readFile(allPath, 'utf-8')
      districts = JSON.parse(fileContent) as CatalogDistrict[]
    }

    if (search) {
      districts = districts.filter((d) => d.name.toLowerCase().includes(search) || d.alias.toLowerCase().includes(search) || d.code.includes(search))
    }

    // If searching, return all matches without slicing. If no search and no regencyCode, return all 7,288 items (compressed ~180 KB over HTTP)
    // so client-side SelectForm instant search and chunked scroll have the complete catalog!

    return NextResponse.json(
      { success: true, data: districts },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
        }
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load districts'
    return NextResponse.json({ success: false, data: [], error: message }, { status: 500 })
  }
}
