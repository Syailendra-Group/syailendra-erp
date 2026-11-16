import { FarmForm } from '@/features/scm/farms/form'

import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const metadata: Metadata = {
  title: 'Create Farm • Syailendra SCM',
  description: 'Register a new farm block with terroir and cultivation data'
}

export default function FarmCreatePage(): ReactElement {
  return <FarmForm />
}
