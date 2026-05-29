export function statusClass(s: string) {
  if (s === 'draft') return 'status-badge status-badge--draft'
  if (s === 'in_progress') return 'status-badge status-badge--in_progress'
  if (s === 'done') return 'status-badge status-badge--done'
  if (s === 'cancelled') return 'status-badge status-badge--cancelled'
  return 'status-badge'
}

export function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}
