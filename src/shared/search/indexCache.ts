import { EMBEDDING_DIM, SEMANTIC_MODEL_VER, type EntityType } from './types'

const DB_NAME = 'semantic-search-cache'
const DB_VERSION = 1
const STORE = 'embeddings'

export type CachedEmbedding = {
  key: string
  type: EntityType
  id: number
  modelVer: string
  hash: string
  dim: number
  vector: Float32Array
  updatedAt: number
}

function buildKey(type: EntityType, id: number, modelVer: string): string {
  return `${modelVer}::${type}::${id}`
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
  return dbPromise
}

export async function getCached(
  type: EntityType,
  id: number,
): Promise<CachedEmbedding | null> {
  try {
    const db = await openDB()
    return await new Promise<CachedEmbedding | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const store = tx.objectStore(STORE)
      const req = store.get(buildKey(type, id, SEMANTIC_MODEL_VER))
      req.onsuccess = () => resolve((req.result as CachedEmbedding | undefined) ?? null)
      req.onerror = () => reject(req.error ?? new Error('IDB get failed'))
    })
  } catch {
    return null
  }
}

export async function getCachedBulk(
  items: Array<{ type: EntityType; id: number }>,
): Promise<Map<string, CachedEmbedding>> {
  const out = new Map<string, CachedEmbedding>()
  if (items.length === 0) return out
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const store = tx.objectStore(STORE)
      let pending = items.length
      if (pending === 0) {
        resolve()
        return
      }
      for (const it of items) {
        const key = buildKey(it.type, it.id, SEMANTIC_MODEL_VER)
        const req = store.get(key)
        req.onsuccess = () => {
          const v = req.result as CachedEmbedding | undefined
          if (v && v.dim === EMBEDDING_DIM) out.set(key, v)
          pending--
          if (pending === 0) resolve()
        }
        req.onerror = () => {
          pending--
          if (pending === 0) resolve()
        }
      }
      tx.onerror = () => reject(tx.error ?? new Error('IDB bulk get failed'))
    })
  } catch {
    // если IndexedDB недоступен — поиск всё равно отработает, просто без кэша
  }
  return out
}

export async function putBulk(records: CachedEmbedding[]): Promise<void> {
  if (records.length === 0) return
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      for (const r of records) store.put(r)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('IDB put failed'))
      tx.onabort = () => reject(tx.error ?? new Error('IDB put aborted'))
    })
  } catch {
    // тихо — кэш не критичен
  }
}

export function makeCacheRecord(
  type: EntityType,
  id: number,
  hash: string,
  vector: Float32Array,
): CachedEmbedding {
  return {
    key: buildKey(type, id, SEMANTIC_MODEL_VER),
    type,
    id,
    modelVer: SEMANTIC_MODEL_VER,
    hash,
    dim: vector.length,
    vector,
    updatedAt: Date.now(),
  }
}

export function cacheKey(type: EntityType, id: number): string {
  return buildKey(type, id, SEMANTIC_MODEL_VER)
}
