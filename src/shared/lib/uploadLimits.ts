/** Должны совпадать с MINIO_MAX_*_BYTES на сервере (значения по умолчанию). */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

function prefixRoot(prefix?: string): string {
  const p = (prefix ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase()
  if (!p) return ''
  const i = p.indexOf('/')
  return i >= 0 ? p.slice(0, i) : p
}

function isImageContentType(contentType: string): boolean {
  return contentType.toLowerCase().startsWith('image/')
}

/** Лимит для пары prefix + MIME (логика как на сервере). */
export function maxBytesForUpload(prefix: string | undefined, file: Pick<File, 'type'>): number {
  const root = prefixRoot(prefix)
  switch (root) {
    case 'docs':
      return MAX_DOCUMENT_BYTES
    case 'users':
    case 'equipment':
    case 'models':
    case 'types':
      return MAX_IMAGE_BYTES
    default:
      return isImageContentType(file.type || '') ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES
  }
}

export function uploadSizeLimitMessage(prefix: string | undefined, file: Pick<File, 'type'>): string {
  const max = maxBytesForUpload(prefix, file)
  const mb = max / (1024 * 1024)
  const kind = max === MAX_IMAGE_BYTES ? 'изображений' : 'документов'
  return `Максимальный размер для ${kind}: ${mb} МБ`
}

export function assertUploadSize(file: File, prefix?: string): void {
  const max = maxBytesForUpload(prefix, file)
  if (file.size > max) {
    throw new Error(uploadSizeLimitMessage(prefix, file))
  }
}
