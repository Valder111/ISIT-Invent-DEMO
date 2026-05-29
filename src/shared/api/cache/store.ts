import type { ApiMeta } from '../types'
import { logCache } from './logger'
import type { ClientCacheResult } from './types'

type Entry<T> = {
  data: T
  meta?: ApiMeta
  expiresAt: number
}

const memory = new Map<string, Entry<unknown>>()

const TTL_MS: Record<string, number> = {
  types: 5 * 60 * 1000,
  locations: 5 * 60 * 1000,
  models: 3 * 60 * 1000,
  equipment: 90 * 1000,
  report: 3 * 60 * 1000,
}

function ttlForKey(key: string): number {
  if (key.startsWith('equipment:')) return TTL_MS.equipment
  if (key.startsWith('models:')) return TTL_MS.models
  if (key.startsWith('locations:')) return TTL_MS.locations
  if (key.startsWith('report:')) return TTL_MS.report
  return TTL_MS.types
}

export function getCached<T>(key: string): T | null {
  return getCachedEntry<T>(key)?.data ?? null
}

export function getCachedMeta(key: string): ApiMeta | undefined {
  return getCachedEntry(key)?.meta
}

export function getCachedEntry<T>(key: string): { data: T; meta?: ApiMeta } | null {
  const e = memory.get(key)
  if (!e) {
    logCache(key, 'miss')
    return null
  }
  if (Date.now() > e.expiresAt) {
    memory.delete(key)
    logCache(key, 'miss', 'expired')
    return null
  }
  logCache(key, 'hit')
  return { data: e.data as T, meta: e.meta }
}

export function setCached<T>(key: string, data: T, opts?: { ttlMs?: number; meta?: ApiMeta }): void {
  const ttl = opts?.ttlMs ?? ttlForKey(key)
  memory.set(key, { data, meta: opts?.meta, expiresAt: Date.now() + ttl })
  logCache(key, 'set', `ttl_ms=${ttl}`)
}

export function invalidateKey(key: string): void {
  if (memory.delete(key)) {
    logCache(key, 'invalidate')
  }
}

export function invalidatePrefix(prefix: string): void {
  let n = 0
  for (const k of memory.keys()) {
    if (k.startsWith(prefix)) {
      memory.delete(k)
      n++
    }
  }
  logCache(prefix + '*', 'invalidate', `deleted=${n}`)
}

export function invalidateTypes(): void {
  invalidatePrefix('types:')
}

export function invalidateLocations(): void {
  invalidatePrefix('locations:')
}

export function invalidateModels(): void {
  invalidatePrefix('models:')
}

export function invalidateEquipment(): void {
  invalidatePrefix('equipment:')
  invalidatePrefix('report:')
}

export function invalidateCatalog(): void {
  invalidateTypes()
  invalidateModels()
}

export function invalidateAllEquipmentDomain(): void {
  invalidateCatalog()
  invalidateLocations()
  invalidateEquipment()
}

export function logCacheError(key: string, detail: string): void {
  logCache(key, 'error' satisfies ClientCacheResult, detail)
}
