import type { ResponseResponse } from '../generated/data-contracts'
import { apiAxios, unwrapEnvelopeWithMeta } from '../axiosInstance'
import type { ApiMeta } from '../types'
import { getCachedEntry, logCacheError, setCached } from './store'
import type { CachedFetchResult } from './types'

function mergeServerCache(meta: ApiMeta | undefined, headers: Record<string, unknown> | undefined): ApiMeta | undefined {
  const raw = headers?.['x-cache'] ?? headers?.['X-Cache']
  const header = typeof raw === 'string' ? raw.toLowerCase() : undefined
  const fromHeader = header === 'hit' || header === 'miss' ? header : undefined
  const fromMeta = meta?.cache === 'hit' || meta?.cache === 'miss' ? meta.cache : undefined
  const cache = fromMeta ?? fromHeader
  if (!cache && !meta) return meta
  return { ...meta, ...(cache ? { cache } : {}) }
}

/** GET с клиентским кэшем (memory) и пробросом серверного X-Cache. */
export async function cachedListFetch<T>(
  cacheKey: string,
  path: string,
): Promise<CachedFetchResult<T>> {
  const hit = getCachedEntry<T>(cacheKey)
  if (hit !== null) {
    return { data: hit.data, meta: hit.meta, source: 'memory', serverCache: hit.meta?.cache }
  }

  const res = await apiAxios.get<ResponseResponse>(path)
  const { data, meta: rawMeta } = unwrapEnvelopeWithMeta<T>(res)
  const meta = mergeServerCache(rawMeta, res.headers)
  setCached(cacheKey, data, { meta })
  return {
    data,
    meta,
    source: 'network',
    serverCache: meta?.cache,
  }
}

/** Обёртка для GET через сгенерированный API (или иной fetcher с meta). */
export async function cachedListFetchViaMeta<T>(
  cacheKey: string,
  fetcher: () => Promise<{ data: T; meta?: ApiMeta }>,
): Promise<CachedFetchResult<T>> {
  const hit = getCachedEntry<T>(cacheKey)
  if (hit !== null) {
    return { data: hit.data, meta: hit.meta, source: 'memory', serverCache: hit.meta?.cache }
  }
  try {
    const { data, meta } = await fetcher()
    setCached(cacheKey, data, { meta })
    return {
      data,
      meta,
      source: 'network',
      serverCache: meta?.cache,
    }
  } catch (e) {
    logCacheError(cacheKey, e instanceof Error ? e.message : 'fetch failed')
    throw e
  }
}
