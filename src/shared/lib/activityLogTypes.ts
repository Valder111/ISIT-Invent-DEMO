/** Значения поля `type` в журнале действий (сервер). */
export const ACTIVITY_LOG_TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'ticket', label: 'Заявки' },
  { value: 'ticket_item', label: 'Позиции заявок' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'models', label: 'Модели' },
  { value: 'types', label: 'Категории' },
  { value: 'locations', label: 'Локации' },
  { value: 'documents', label: 'Документы' },
  { value: 'writeoffs', label: 'Списания' },
] as const

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_LOG_TYPE_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label]),
)

export function activityLogTypeRu(type: string | undefined): string {
  if (!type) return '—'
  return TYPE_LABELS[type] ?? type
}
