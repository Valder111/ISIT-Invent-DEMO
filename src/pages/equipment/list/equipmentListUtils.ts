export type Level = 'category' | 'model' | 'instance'
export type SortKey = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc'

export function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU')
  } catch {
    return iso
  }
}

export function fmtScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function sortByName<T extends { name: string }>(items: T[], dir: 'asc' | 'desc') {
  return [...items].sort((a, b) => {
    const c = a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' })
    return dir === 'asc' ? c : -c
  })
}

export function sortByDate<T extends { created_at: string }>(items: T[], dir: 'asc' | 'desc') {
  return [...items].sort((a, b) => {
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    return dir === 'asc' ? ta - tb : tb - ta
  })
}
