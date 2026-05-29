import type { UserRole } from '../api/auth'

/** Базовый URL панели редактирования для шапки (только admin и inventory_manager по ТЗ). */
export function inventoryEditPanelHome(role: UserRole): string | null {
  if (role === 'admin') return '/panel/admin/equipment'
  if (role === 'inventory_manager') return '/panel/inventory/equipment'
  return null
}

/** Панель лаборанта в шапке (только роль лаборанта). */
export function laborantPanelHome(role: UserRole): string | null {
  if (role === 'laborant') return '/panel/laborant/tickets'
  return null
}

export function ticketsPanelPath(role: UserRole): string | null {
  if (role === 'admin') return '/panel/admin/tickets'
  if (role === 'inventory_manager') return '/panel/inventory/tickets'
  if (role === 'laborant') return '/panel/laborant/tickets'
  return null
}
