const BYTE_UNITS = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'] as const

/** Дата/время для таблиц (ru-RU). */
export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

/** Человекочитаемый размер (1024-based). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 Б'
  const i = Math.min(BYTE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const val = bytes / 1024 ** i
  const rounded = i === 0 ? Math.round(val) : Math.round(val * 100) / 100
  return `${rounded} ${BYTE_UNITS[i]}`
}
