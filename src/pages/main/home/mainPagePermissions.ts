import type { UserRole } from '../../../shared/api/auth'

export type Stats = {
  equipment: number | null
  tickets: number | null
  documents: number | null
  users?: number | null
}

export function canSeeUserDirectory(role: UserRole | undefined): role is 'admin' | 'inventory_manager' {
  return role === 'admin' || role === 'inventory_manager'
}

export function canUseEquipmentReport(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'inventory_manager' || role === 'laborant'
}

export function canOpenWriteOffs(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'inventory_manager'
}
