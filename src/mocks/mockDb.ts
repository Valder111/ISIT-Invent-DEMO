import type { MeResponse, UserRole } from '../shared/api/auth'
import type { EquipmentCategory, EquipmentInstance, EquipmentModel, Location } from '../shared/api/equipment'
import type { ActivityLog } from '../shared/api/activity'
import type { PlatformDocument } from '../shared/api/documents'
import type { Ticket, TicketItem } from '../shared/api/tickets'
import type { WriteOff } from '../shared/api/writeoffs'

import { clearAllObjects } from './demoStorage'
import usersSeed from '../shared/mocks/data/users.json'
import typesSeed from '../shared/mocks/data/types.json'
import modelsSeed from '../shared/mocks/data/models.json'
import locationsSeed from '../shared/mocks/data/locations.json'
import instancesSeed from '../shared/mocks/data/instances.json'
import ticketsSeed from '../shared/mocks/data/tickets.json'
import ticketItemsSeed from '../shared/mocks/data/ticket_items.json'
import documentsSeed from '../shared/mocks/data/documents.json'
import writeoffsSeed from '../shared/mocks/data/writeoffs.json'
import activitySeed from '../shared/mocks/data/activity.json'

export type DemoUser = MeResponse & { password: string }

export type DemoDb = {
  users: DemoUser[]
  sessionUserId: number | null
  types: EquipmentCategory[]
  models: EquipmentModel[]
  locations: Location[]
  instances: EquipmentInstance[]
  tickets: Ticket[]
  ticketItems: TicketItem[]
  documents: PlatformDocument[]
  writeoffs: WriteOff[]
  activity: ActivityLog[]
}

const LS_KEY = 'isit-invent-demo-db:v1'

function seedDb(): DemoDb {
  const users = usersSeed as DemoUser[]

  return {
    users,
    sessionUserId: 1,
    types: typesSeed as EquipmentCategory[],
    models: modelsSeed as EquipmentModel[],
    locations: locationsSeed as Location[],
    instances: instancesSeed as EquipmentInstance[],
    tickets: ticketsSeed as Ticket[],
    ticketItems: ticketItemsSeed as TicketItem[],
    documents: documentsSeed as PlatformDocument[],
    writeoffs: writeoffsSeed as WriteOff[],
    activity: activitySeed as ActivityLog[],
  }
}

function readDb(): DemoDb {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return seedDb()
    const parsed = JSON.parse(raw) as DemoDb
    if (!parsed || !Array.isArray(parsed.users)) return seedDb()
    return parsed
  } catch {
    return seedDb()
  }
}

function writeDb(db: DemoDb) {
  localStorage.setItem(LS_KEY, JSON.stringify(db))
}

let dbCache: DemoDb | null = null

export function getDb(): DemoDb {
  if (!dbCache) dbCache = readDb()
  return dbCache
}

export function setDb(next: DemoDb) {
  dbCache = next
  writeDb(next)
}

export function currentMe(): MeResponse | null {
  const db = getDb()
  if (!db.sessionUserId) return null
  const u = db.users.find((x) => x.id === db.sessionUserId)
  if (!u) return null
  const { password: _pw, ...me } = u
  return me
}

export function loginByCredentials(login: string, password: string): { ok: true; me: MeResponse } | { ok: false } {
  const db = getDb()
  const norm = login.trim().toLowerCase()
  const u = db.users.find((x) => x.email.toLowerCase() === norm || x.username.trim().toLowerCase() === norm)
  if (!u) return { ok: false }
  if (u.password !== password) return { ok: false }
  setDb({ ...db, sessionUserId: u.id })
  const { password: _pw, ...me } = u
  return { ok: true, me }
}

export function logout() {
  const db = getDb()
  setDb({ ...db, sessionUserId: null })
}

export function patchMe(patch: Partial<Pick<MeResponse, 'username' | 'email' | 'img' | 'img_url' | 'comment' | 'is_active'>>) {
  const db = getDb()
  if (!db.sessionUserId) return null
  const idx = db.users.findIndex((x) => x.id === db.sessionUserId)
  if (idx < 0) return null
  const updated = { ...db.users[idx], ...patch, updated_at: new Date().toISOString() }
  const users = db.users.slice()
  users[idx] = updated
  setDb({ ...db, users })
  const { password: _pw, ...me } = updated
  return me
}

/** Сброс демо-БД: localStorage + кэш; IndexedDB — отдельно через resetDemoFiles(). */
export function resetDemoDb() {
  dbCache = null
  localStorage.removeItem(LS_KEY)
}

export async function resetDemoFiles() {
  await clearAllObjects()
}

export async function resetDemo() {
  resetDemoDb()
  await resetDemoFiles()
}

export function listUsers(): Array<Pick<MeResponse, 'id' | 'username' | 'email' | 'role' | 'img_url' | 'is_active'>> {
  const db = getDb()
  return db.users.map(({ password: _pw, ...u }) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role as UserRole,
    img_url: u.img_url,
    is_active: u.is_active,
  }))
}

