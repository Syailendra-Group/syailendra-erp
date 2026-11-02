'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useSaveProvinceMutation } from '@/hooks/others/use-provinces'
import { Link, useRouter } from '@/i18n/navigation'
import { provinceFormSchema } from '@/schemas/others/province-schema'

import { IdentitySection } from './identity-section'

import type { ProvinceFormValues } from '@/schemas/others/province-schema'
import type { ProvinceRecord } from '@/types/others/province'
import type { ReactElement } from 'react'

export interface ProvinceFormProps {
  initialData?: ProvinceRecord | null
}

export function ProvinceForm({ initialData }: ProvinceFormProps): ReactElement {
  const isEdit = !!initialData
  const router = useRouter()
  const t = useTranslations('regional.provinces')
  const tCommon = useTranslations('common')
  const { mutateAsync: saveProvince, isPending } = useSaveProvinceMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProvinceFormValues>({
    resolver: zodResolver(provinceFormSchema),
    defaultValues: {
      id: initialData?.id,
      is_domestic: true,
      name: initialData?.name || '',
      code: initialData?.code || '',
      country_id: initialData?.country_id ? initialData.country_id[0] : 100,
      alias: '',
      description: ''
    }
  })

  const onSubmit = async (values: ProvinceFormValues) => {
    try {
      const res = await saveProvince(values)
      if (res.success) {
        toast.success(isEdit ? 'Provinsi berhasil diperbarui' : 'Provinsi berhasil didaftarkan')
        router.push('/others/provinces')
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menyimpan provinsi')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan provinsi')
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        showBack={true}
        backHref="/others/provinces"
        backLabel="Kembali ke Daftar Provinsi"
        title={isEdit ? t('dialog.editTitle') : t('dialog.addTitle')}
        description={isEdit ? t('dialog.editDesc') : t('dialog.addDesc')}
      />

      <form id="province-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="max-w-2xl">
          <IdentitySection register={register} errors={errors} watch={watch} setValue={setValue} isPending={isPending} />
        </div>

        <div className="border-border/60 bg-background/90 sticky bottom-4 z-20 flex max-w-2xl items-center justify-between rounded-xl border p-3 shadow-md backdrop-blur-md">
          <Button variant="outline" asChild>
            <Link href="/others/provinces">{tCommon('actions.cancel')}</Link>
          </Button>
          <Button type="submit" form="province-form" disabled={isPending} className="cursor-pointer gap-2 font-semibold">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{isPending ? tCommon('actions.loading') : isEdit ? tCommon('actions.save') : t('primaryAction')}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
