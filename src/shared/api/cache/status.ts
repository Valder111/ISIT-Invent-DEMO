import type { ClientDataSource } from './types'

export type LastCacheStatus = {
  resource: string
  clientSource: ClientDataSource
  serverCache?: 'hit' | 'miss'
  at: number
}

let last: LastCacheStatus | null = null
const listeners = new Set<() => void>()

export function publishCacheStatus(status: LastCacheStatus): void {
  last = status
  for (const fn of listeners) fn()
}

export function getLastCacheStatus(): LastCacheStatus | null {
  return last
}

export function subscribeCacheStatus(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function formatCacheStatus(s: LastCacheStatus | null): string {
  if (!s) return ''
  const client = s.clientSource === 'memory' ? 'клиент: кэш (hit)' : 'клиент: сеть (miss)'
  const server =
    s.serverCache === 'hit'
      ? 'сервер: кэш (hit)'
      : s.serverCache === 'miss'
        ? 'сервер: БД (miss)'
        : 'сервер: —'
  return `${client} · ${server}`
}
