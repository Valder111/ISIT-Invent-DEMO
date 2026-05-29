import { getEmbeddingClient } from './embeddingClient'
import { cacheKey, getCachedBulk, makeCacheRecord, putBulk } from './indexCache'
import type { EntityType, SearchDoc, SearchHit } from './types'

const EMBED_BATCH = 16

/** Простой FNV-1a 32-битный хэш — инвалидация кэша. */
function hashText(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h.toString(16)
}

/** Склейка name + description + comment с понижением шума пробелов. */
export function buildSearchText(parts: Array<string | null | undefined>): string {
  return parts
    .map((s) => (s ?? '').trim())
    .filter((s) => s.length > 0)
    .join(' \u2014 ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) dot += a[i] * b[i]
  // Векторы уже нормализованы, поэтому косинус = dot.
  return dot
}

type IndexedItem = { type: EntityType; id: number; vector: Float32Array; text: string }

export type IndexBuildProgress = {
  total: number
  encoded: number
  fromCache: number
  newlyEncoded: number
}

export type IndexBuildResult = {
  items: IndexedItem[]
  fromCache: number
  newlyEncoded: number
}

/**
 * Строит индекс для набора документов: тянет готовые векторы из IndexedDB,
 * остальные считает в воркере батчами и кладёт обратно в кэш.
 */
export async function buildIndex(
  docs: SearchDoc[],
  opts?: { onProgress?: (p: IndexBuildProgress) => void; signal?: AbortSignal },
): Promise<IndexBuildResult> {
  const onProgress = opts?.onProgress
  const signal = opts?.signal
  const throwIfAborted = () => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  }

  if (docs.length === 0) {
    return { items: [], fromCache: 0, newlyEncoded: 0 }
  }

  // Готовность текстов + хэши
  const prepared = docs.map((d) => {
    const text = (d.text ?? '').trim()
    return { ...d, text, hash: hashText(text) }
  })

  // Достаем из кэша
  const cached = await getCachedBulk(prepared.map((p) => ({ type: p.type, id: p.id })))
  throwIfAborted()

  const items: IndexedItem[] = []
  const toEncode: Array<{ doc: (typeof prepared)[number]; index: number }> = []
  let fromCache = 0

  for (const p of prepared) {
    const hit = cached.get(cacheKey(p.type, p.id))
    if (hit && hit.hash === p.hash) {
      items.push({ type: p.type, id: p.id, vector: hit.vector, text: p.text })
      fromCache++
    } else if (p.text.length === 0) {
      // совсем пустой текст пропускается (нет смысла кодировать)
      continue
    } else {
      toEncode.push({ doc: p, index: items.length })
      items.push({ type: p.type, id: p.id, vector: new Float32Array(0), text: p.text })
    }
  }

  onProgress?.({
    total: prepared.length,
    encoded: fromCache,
    fromCache,
    newlyEncoded: 0,
  })

  if (toEncode.length === 0) {
    return { items, fromCache, newlyEncoded: 0 }
  }

  // Кодирование недостающих батчами
  const client = getEmbeddingClient()
  let newlyEncoded = 0
  const toCache: ReturnType<typeof makeCacheRecord>[] = []

  for (let i = 0; i < toEncode.length; i += EMBED_BATCH) {
    throwIfAborted()
    const slice = toEncode.slice(i, i + EMBED_BATCH)
    const vectors = await client.embed(slice.map((s) => s.doc.text))
    throwIfAborted()
    for (let j = 0; j < slice.length; j++) {
      const v = vectors[j]
      const { doc, index } = slice[j]
      items[index].vector = v
      toCache.push(makeCacheRecord(doc.type, doc.id, doc.hash, v))
    }
    newlyEncoded += slice.length
    onProgress?.({
      total: prepared.length,
      encoded: fromCache + newlyEncoded,
      fromCache,
      newlyEncoded,
    })
  }

  // Складирование в кэш (fire-and-forget)
  await putBulk(toCache)

  // Удаление элементов с пустыми векторами (если такие остались — например, ошибка кодирования)
  const filtered = items.filter((it) => it.vector.length > 0)

  return { items: filtered, fromCache, newlyEncoded }
}

/** Кодирование запроса пользователя и ранжирование индекса по косинусной близости. */
export async function semanticSearch(
  query: string,
  index: IndexedItem[],
  opts?: { topK?: number; minScore?: number; signal?: AbortSignal },
): Promise<SearchHit[]> {
  const trimmed = query.trim()
  if (trimmed.length === 0 || index.length === 0) return []
  const topK = opts?.topK ?? 50
  const minScore = opts?.minScore ?? 0.15
  const signal = opts?.signal

  const client = getEmbeddingClient()
  const [qVec] = await client.embed([trimmed])
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const hits: SearchHit[] = []
  for (const it of index) {
    if (it.vector.length === 0) continue
    const score = cosine(qVec, it.vector)
    if (score >= minScore) hits.push({ type: it.type, id: it.id, score })
  }
  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, topK)
}

export type { IndexedItem }
