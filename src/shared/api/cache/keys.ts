/** Нормализованный ключ query для списков. */
export function queryKey(parts: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(parts)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${String(v)}`)
    .sort()
  return entries.join('&') || '_'
}

export const cacheKeys = {
  typesList: () => 'types:list',
  typeId: (id: number) => `types:id:${id}`,
  locationsList: () => 'locations:list',
  locationId: (id: number) => `locations:id:${id}`,
  modelsList: (q: string) => `models:list:${q}`,
  modelId: (id: number) => `models:id:${id}`,
  equipmentList: (q: string) => `equipment:list:${q}`,
  equipmentId: (id: number) => `equipment:id:${id}`,
  reportEquipmentStatus: () => 'report:equipment-status',
} as const

export const cachePrefixes = {
  types: 'types:',
  locations: 'locations:',
  models: 'models:',
  equipment: 'equipment:',
  reports: 'report:',
} as const
