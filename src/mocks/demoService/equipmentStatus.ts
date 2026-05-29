/** Канонический статус экземпляра в демо (seed: ok / repair / written_off). */
export function canonicalEquipmentStatus(status: string): string {
  if (status === 'active' || status === 'ok') return 'ok'
  if (status === 'broken' || status === 'repair') return 'repair'
  if (status === 'written_off') return 'written_off'
  return status
}

export function instanceMatchesStatusFilter(instanceStatus: string, filterStatus: string): boolean {
  return canonicalEquipmentStatus(instanceStatus) === canonicalEquipmentStatus(filterStatus)
}
