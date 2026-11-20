/**
 * crop-image.ts — Pure HTML5 Canvas cropping & rotation helper for react-easy-crop
 * Preserves PNG/WebP transparency for corporate logos and returns File + Base64 + ObjectURL
 * Syailendra Group ERP
 */

import type { Area } from 'react-easy-crop'

export interface CropImageOptions {
  imageSrc: string
  pixelCrop: Area
  rotation?: number
  fileName?: string
  mimeType?: 'image/png' | 'image/webp' | 'image/jpeg'
  quality?: number
  maxOutputBytes?: number
}

export interface CroppedImageResult {
  file: File
  base64: string
  dataUrl: string
  objectUrl: string
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      image.setAttribute('crossOrigin', 'anonymous')
    }
    image.src = url
  })
}

export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180
}

export function rotateSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  }
}

export async function getCroppedImg({
  imageSrc,
  pixelCrop,
  rotation = 0,
  fileName = 'cropped-image.png',
  mimeType = 'image/png',
  quality = 0.92,
  maxOutputBytes
}: CropImageOptions): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to acquire 2D canvas context for cropping')
  }

  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    throw new Error('Failed to acquire 2D cropped canvas context')
  }

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedCtx.drawImage(canvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  let outputQuality = quality
  const toBlob = (qualityValue: number) =>
    new Promise<Blob>((resolve, reject) => {
      croppedCanvas.toBlob((value) => (value ? resolve(value) : reject(new Error('Canvas toBlob returned null'))), mimeType, qualityValue)
    })
  let blob = await toBlob(outputQuality)
  while (maxOutputBytes && blob.size > maxOutputBytes && outputQuality > 0.35) {
    outputQuality -= 0.1
    blob = await toBlob(outputQuality)
  }
  if (maxOutputBytes && blob.size > maxOutputBytes) throw new Error('CROP_OUTPUT_TOO_LARGE')
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Failed to read cropped image')))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
  const base64 = dataUrl.split(',')[1] || ''

  const file = new File([blob], fileName, { type: mimeType })
  const objectUrl = URL.createObjectURL(blob)

  return {
    file,
    base64,
    dataUrl,
    objectUrl
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = reader.result
      if (typeof res === 'string') {
        resolve(res.split(',')[1] || '')
      } else {
        reject(new Error('Failed to read file as base64'))
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}
