/** Результат операции с клиентским кэшем (для логов и UI). */
export type ClientCacheResult = 'hit' | 'miss' | 'set' | 'invalidate' | 'error'

/** Источник данных на клиенте. */
export type ClientDataSource = 'memory' | 'network'

export type CachedFetchResult<T> = {
  data: T
  meta?: import('../types').ApiMeta
  /** Клиентский кэш: memory = hit, network = miss (или после сети). */
  source: ClientDataSource
  /** Серверный кэш из X-Cache / meta.cache. */
  serverCache?: 'hit' | 'miss'
}
