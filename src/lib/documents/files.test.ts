import { isImageMimeType, isPdfMimeType, sanitizeFilename } from '@/lib/documents/files'

describe('document file helpers', () => {
  it('sanitizes filenames safely', () => {
    expect(sanitizeFilename('Passaporte Fábio 2026!.pdf')).toBe(
      'passaporte-fabio-2026-.pdf',
    )
  })

  it('recognizes previewable mime types', () => {
    expect(isPdfMimeType('application/pdf')).toBe(true)
    expect(isImageMimeType('image/webp')).toBe(true)
  })
})
