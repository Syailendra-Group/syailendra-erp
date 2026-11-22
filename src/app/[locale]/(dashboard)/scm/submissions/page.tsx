import { Metadata } from 'next'

import { SubmissionsFeature } from '@/features/scm/submissions'

import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Pengajuan Mitra',
  description: 'Tinjauan dan verifikasi pengajuan mitra oleh staf operasional'
}

export default function SubmissionsPage(): ReactElement {
  return <SubmissionsFeature />
}
