import {
  DOCUMENT_ALLOWED_MIME_TYPES,
  DOCUMENT_MAX_FILE_SIZE_BYTES,
} from '@/lib/documents/config'

export function sanitizeFilename(filename: string) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export function validateDocumentFile(file: File) {
  if (!DOCUMENT_ALLOWED_MIME_TYPES.includes(file.type as (typeof DOCUMENT_ALLOWED_MIME_TYPES)[number])) {
    throw new Error('Unsupported document type. Use PDF, JPEG, PNG, or WebP.')
  }

  if (file.size > DOCUMENT_MAX_FILE_SIZE_BYTES) {
    throw new Error('Document exceeds the 10MB upload limit.')
  }
}

export function isImageMimeType(mimeType: string) {
  return mimeType.startsWith('image/')
}

export function isPdfMimeType(mimeType: string) {
  return mimeType === 'application/pdf'
}
