'use client'

import { useCallback, useState } from 'react'
import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Cropper from 'react-easy-crop'
import { toast } from 'sonner'

import { LoadingButton } from '@/components/button/loading-button'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getCroppedImg } from '@/utils/crop-image'
import { resolveImageSrc } from '@/utils/get-initials'

import type { CroppedImageResult } from '@/utils/crop-image'
import type { ReactElement } from 'react'
import type { Area, Point } from 'react-easy-crop'

export interface CropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  aspectRatio?: number
  fileName?: string
  mimeType?: 'image/png' | 'image/webp' | 'image/jpeg'
  onCropCompleteResult: (result: CroppedImageResult) => void
}

export function CropDialog({
  open,
  onOpenChange,
  imageSrc,
  aspectRatio = 1,
  fileName = 'cropped-image.png',
  mimeType = 'image/png',
  onCropCompleteResult
}: CropDialogProps): ReactElement {
  const t = useTranslations('common.dropzone')
  const resolvedImageSrc = resolveImageSrc(imageSrc) || imageSrc

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const result = await getCroppedImg({
        imageSrc: resolvedImageSrc,
        pixelCrop: croppedAreaPixels,
        rotation,
        fileName,
        mimeType
      })
      onCropCompleteResult(result)
      onOpenChange(false)
    } catch {
      toast.error(t('cropError'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('cropImage')}</DialogTitle>
          <DialogDescription className="text-xs">{t('cropDescription')}</DialogDescription>
        </DialogHeader>

        {/* Interactive react-easy-crop canvas */}
        <div className="bg-muted/80 relative h-72 w-full overflow-hidden rounded-xl border sm:h-80">
          <Cropper
            image={resolvedImageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
          />
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <ZoomOut className="text-muted-foreground size-4 shrink-0" />
            <input
              type="range"
              aria-label="Zoom"
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
            <ZoomIn className="text-muted-foreground size-4 shrink-0" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button type="button" variant="outline" onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)} className="gap-1.5 text-xs">
              <RotateCcw className="size-4" />
              <span>-90°</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => setRotation((prev) => (prev + 90) % 360)} className="gap-1.5 text-xs">
              <RotateCw className="size-4" />
              <span>+90°</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="border-border/50 mt-4 gap-2 border-t pt-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <LoadingButton type="button" isLoading={isProcessing} onClick={handleSaveCrop}>
            <span>{t('cropSave')}</span>
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
