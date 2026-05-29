import type { MeResponse } from '../../shared/api/auth'
import type { ActivityLog } from '../../shared/api/activity'
import { forbidden } from './errors'
import { getDb, setDb } from '../mockDb'

export function nowIso() {
  return new Date().toISOString()
}

export function nextId(items: Array<{ id: number }>) {
  return (items.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1
}

export function parseNumber(v: string | undefined | null): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function requireRole(me: MeResponse, roles: MeResponse['role'][]) {
  if (!roles.includes(me.role)) throw forbidden()
}

export function appendActivity(entry: Omit<ActivityLog, 'id'>) {
  const db = getDb()
  const id = nextId(db.activity)
  setDb({
    ...db,
    activity: [{ ...entry, id }, ...db.activity],
  })
}

export function randomQrToken() {
  return `qr-${crypto.randomUUID()}`
}
