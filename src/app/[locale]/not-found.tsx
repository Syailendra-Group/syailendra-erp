'use client'

import { FileQuestion } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

import type { ReactElement } from 'react'

export default function NotFoundPage(): ReactElement {
  const tCommon = useTranslations('common')

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-2xl border">
        <FileQuestion className="size-8" />
      </div>
      <h1 className="font-heading text-2xl font-bold tracking-tight">404 — Page Not Found</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        Halaman yang Anda cari tidak tersedia atau sesi Anda belum aktif. Silakan masuk ke sistem terlebih dahulu.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild variant="outline" className="font-semibold">
          <Link href="/login">Masuk ke Sistem (Login)</Link>
        </Button>
        <Button asChild className="font-semibold">
          <Link href="/ftm">{tCommon('actions.back') || 'Kembali ke Dashboard'}</Link>
        </Button>
      </div>
    </div>
  )
}
