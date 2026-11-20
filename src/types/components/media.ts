export type MediaKind = 'image' | 'document'
export type MediaRole = 'profile' | 'gallery' | 'facility' | 'product' | 'certificate' | 'legal' | 'other'

export interface MediaRecord {
  id: number
  resModel: string
  resId: number
  kind: MediaKind
  role: MediaRole
  name: string
  sequence: number
  mimetype: string
  fileSize: number
  caption: string
  altText: string
  companyId: number | null
  url: string
}

export interface MediaImageItem {
  id?: number
  clientId?: string
  file?: File
  preview?: string
  src?: string
  base64?: string
  name: string
  caption?: string
  altText?: string
  sequence?: number
}

export interface MediaDocumentItem {
  id?: number
  file?: File
  name: string
  url?: string
  mimetype?: string
  fileSize?: number
}

export interface MediaUploadResult {
  success: boolean
  id?: number
  error?: string
}

export interface MediaUploadInput {
  resModel: string
  resId: number
  kind: MediaKind
  role: MediaRole
  name: string
  base64: string
  mimetype: string
  fileSize: number
  caption?: string
  altText?: string
  sequence?: number
}

export interface DocumentDropzoneProps {
  value: MediaDocumentItem[]
  onChange: (value: MediaDocumentItem[]) => void
  disabled?: boolean
  readOnly?: boolean
  maxFiles?: number
  maxFileSize?: number
  className?: string
  error?: string
}

export interface MultiImageDropzoneProps {
  value: MediaImageItem[]
  onChange: (value: MediaImageItem[]) => void
  aspectRatio?: number
  maxFiles?: number
  maxImageSize?: number
  disabled?: boolean
  readOnly?: boolean
  className?: string
  error?: string
}

export interface MediaGalleryProps {
  model: string
  recordId: number
  legacyImageUrl?: string | null
  legacyDocumentUrls?: string[]
  role?: MediaRole
  readOnly?: boolean
  className?: string
}

export interface EntityIdentityCellProps {
  name: string
  secondary?: string
  imageUrl?: string | null
  className?: string
}

export interface OdooMediaRaw {
  id: number
  res_model: string
  res_id: number
  kind: MediaKind
  role: MediaRole
  name: string | false
  sequence: number
  mimetype: string | false
  file_size: number
  caption: string | false
  alt_text: string | false
  company_id: [number, string] | false
  create_date?: string
}
