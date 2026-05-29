const DB_NAME = 'isit-invent-demo-files'
const STORE = 'objects'
const DB_VERSION = 1

export type StoredObject = {
  key: string
  blob: Blob
  contentType: string
  size: number
  lastModified: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

export async function putObject(key: string, blob: Blob, contentType: string): Promise<StoredObject> {
  const normalized = key.replace(/^\/+/, '')
  const record: StoredObject = {
    key: normalized,
    blob,
    contentType,
    size: blob.size,
    lastModified: new Date().toISOString(),
  }
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).put(record)
  })
  db.close()
  return record
}

export async function getObject(key: string): Promise<StoredObject | null> {
  const normalized = key.replace(/^\/+/, '')
  const db = await openDb()
  const result = await new Promise<StoredObject | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    tx.onerror = () => reject(tx.error)
    const req = tx.objectStore(STORE).get(normalized)
    req.onsuccess = () => resolve(req.result as StoredObject | undefined)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return result ?? null
}

export async function deleteObject(key: string): Promise<void> {
  const normalized = key.replace(/^\/+/, '')
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).delete(normalized)
  })
  db.close()
}

export async function listObjects(opts?: {
  prefix?: string
  recursive?: boolean
  limit?: number
  cursor?: string
}): Promise<{ items: StoredObject[]; next_cursor: string }> {
  const prefix = (opts?.prefix ?? '').replace(/^\/+/, '')
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 500)
  const db = await openDb()
  const all = await new Promise<StoredObject[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    tx.onerror = () => reject(tx.error)
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as StoredObject[]) ?? [])
    req.onerror = () => reject(req.error)
  })
  db.close()

  let filtered = all
  if (prefix) {
    filtered = opts?.recursive === false
      ? all.filter((o) => {
          const rest = o.key.startsWith(prefix) ? o.key.slice(prefix.length).replace(/^\//, '') : ''
          return o.key === prefix || (o.key.startsWith(`${prefix}/`) && !rest.includes('/'))
        })
      : all.filter((o) => o.key === prefix || o.key.startsWith(`${prefix}/`))
  }

  filtered.sort((a, b) => a.key.localeCompare(b.key))
  const start = opts?.cursor ? filtered.findIndex((o) => o.key > opts.cursor!) : 0
  const slice = filtered.slice(Math.max(0, start), Math.max(0, start) + limit)
  const next = slice.length === limit && start + limit < filtered.length ? slice[slice.length - 1]?.key : ''
  return { items: slice, next_cursor: next ?? '' }
}

export async function clearAllObjects(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.objectStore(STORE).clear()
  })
  db.close()
}

/** URL для <img src> и presign (относительно origin + Vite base). */
export function presignUrl(key: string): string {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '')
  const encoded = key
    .replace(/^\/+/, '')
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
  return `${base}/api/demo-files/${encoded}`
}

export function isObjectKey(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false
  const v = value.trim()
  if (!v) return false
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/static/')) return false
  return true
}
