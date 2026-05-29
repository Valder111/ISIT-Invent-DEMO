import type { UserRole } from '../api/auth'

const ROLES: Record<UserRole, string> = {
  user: 'Пользователь',
  laborant: 'Лаборант',
  inventory_manager: 'Материально ответственный',
  admin: 'Администратор',
}

export function roleRu(role: string | undefined): string {
  if (!role) return '—'
  return ROLES[role as UserRole] ?? role
}

const TICKET_STATUS: Record<string, string> = {
  draft: 'Черновик',
  in_progress: 'В работе',
  done: 'Выполнена',
  cancelled: 'Отменена',
}

export function ticketStatusRu(status: string | undefined): string {
  if (!status) return '—'
  return TICKET_STATUS[status] ?? status
}

const TICKET_TYPES: Record<string, string> = {
  repair: 'Ремонт',
  network: 'Сеть',
  hardware: 'Оборудование',
  software: 'ПО',
}

export function ticketTypeRu(type: string | undefined): string {
  if (!type) return '—'
  return TICKET_TYPES[type] ?? type
}

const EQUIP: Record<string, string> = {
  ok: 'В норме',
  repair: 'В ремонте',
  active: 'Активно',
  broken: 'Сломано',
  written_off: 'Списано',
}

/** Значения фильтра статуса экземпляра (совпадают с демо seed: ok / repair). */
export const EQUIPMENT_INSTANCE_STATUS_FILTERS = [
  { value: '', label: 'Все' },
  { value: 'ok', label: EQUIP.ok },
  { value: 'repair', label: EQUIP.repair },
  { value: 'written_off', label: EQUIP.written_off },
] as const

export function equipmentStatusRu(code: string | undefined): string {
  if (!code) return '—'
  return EQUIP[code] ?? code
}

export function ynRu(v: boolean | undefined): string {
  if (v === undefined) return '—'
  return v ? 'Да' : 'Нет'
}
