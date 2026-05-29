import type { ClientCacheResult } from './types'

function ts(): string {
  return new Date().toISOString()
}

/** Структурированный лог кэша (консоль; в dev виден в DevTools). */
export function logCache(key: string, result: ClientCacheResult, detail?: string): void {
  const level = result === 'error' ? 'error' : 'info'
  const payload = {
    time: ts(),
    level,
    cache_key: key,
    cache_result: result,
    ...(detail ? { detail } : {}),
  }
  if (!import.meta.env.DEV) {
    return
  }
  if (level === 'error') {
    console.error('[cache]', payload)
  } else {
    console.info('[cache]', payload)
  }
}
