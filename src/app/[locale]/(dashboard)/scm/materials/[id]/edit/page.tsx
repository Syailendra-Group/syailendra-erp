/**
 * page.tsx — Edit Material Page
 * Syailendra Group ERP — SCM Pillar
 */

import { notFound } from 'next/navigation'

import { MaterialForm } from '@/features/scm/materials/form'
import { fetchMaterialById } from '@/services/odoo/scm/material.service'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

interface EditMaterialPageProps {
  params: Promise<{ id: string; locale: string }>
}

export const metadata: Metadata = {
  title: 'Edit Material',
  description: 'Edit botanical commodity specifications and export compliance'
}

export default async function EditMaterialPage({ params }: EditMaterialPageProps): Promise<ReactElement> {
  const { id } = await params
  const material = await fetchMaterialById(Number(id))

  if (!material) {
    notFound()
  }

  return <MaterialForm initialData={material} />
}
