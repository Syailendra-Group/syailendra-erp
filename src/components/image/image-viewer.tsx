'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Viewer from 'viewerjs'

import 'viewerjs/dist/viewer.css'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getInitials, resolveImageSrc } from '@/utils/get-initials'

import type { ReactElement } from 'react'

export interface ImageViewerProps {
  src: string | null | undefined
  alt: string
  fallbackText?: string
  disabled?: boolean
  skeleton?: boolean
  objectFit?: 'cover' | 'contain'
  className?: string
  imageClassName?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

export function ImageViewer({
  src,
  alt,
  fallbackText,
  disabled = false,
  skeleton = false,
  objectFit = 'cover',
  className,
  imageClassName,
  sizes,
  fill = true,
  width,
  height
}: ImageViewerProps): ReactElement {
  const resolvedSrc = resolveImageSrc(src)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [prevSrc, setPrevSrc] = useState(resolvedSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Reset loading and error states during render when src changes
  if (resolvedSrc !== prevSrc) {
    setPrevSrc(resolvedSrc)
    setIsLoading(true)
    setHasError(false)
  }

  // Initialize/reinitialize ViewerJS on the container element
  useEffect(() => {
    if (disabled || !resolvedSrc || hasError || !containerRef.current) return

    const viewer = new Viewer(containerRef.current, {
      button: true,
      navbar: false,
      title: false,
      toolbar: {
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        prev: false,
        next: false,
        play: false,
        rotateLeft: 1,
        rotateRight: 1,
        flipHorizontal: 1,
        flipVertical: 1
      },
      tooltip: false,
      transition: true,
      fullscreen: true,
      keyboard: true
    })

    viewerRef.current = viewer

    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [disabled, resolvedSrc, hasError, isLoading])

  const initials = getInitials(fallbackText || alt)

  // Fallback view when there is no src or if image loading has failed
  if (!resolvedSrc || hasError) {
    return (
      <div
        className={cn(
          'bg-primary text-primary-foreground flex items-center justify-center font-bold tracking-wider shadow-xs select-none',
          fill && 'size-full',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span>{initials}</span>
      </div>
    )
  }

  const showSkeleton = skeleton || isLoading

  return (
    <div
      ref={containerRef}
      className={cn('bg-primary/5 relative overflow-hidden select-none', fill && 'size-full', !disabled && 'cursor-zoom-in', className)}
      style={!fill ? { width, height } : undefined}
    >
      {showSkeleton && <Skeleton className="rounded-inherit absolute inset-0 z-10 h-full w-full" />}
      <Image
        src={resolvedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        unoptimized
        className={cn(
          objectFit === 'contain' ? 'object-contain' : 'object-cover',
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          imageClassName
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
