import { useEffect, useMemo, useRef, useState } from 'react'
import { getEmbeddingClient, type EmbeddingStatus } from './embeddingClient'
import { buildIndex, semanticSearch, type IndexedItem } from './semanticSearch'
import type { SearchDoc, SearchHit } from './types'

export type IndexState =
  | { kind: 'idle' }
  | { kind: 'building'; encoded: number; total: number; fromCache: number }
  | { kind: 'ready'; size: number; fromCache: number; newlyEncoded: number }
  | { kind: 'error'; message: string }

export type SearchState =
  | { kind: 'idle' }
  | { kind: 'searching' }
  | { kind: 'done'; hits: SearchHit[] }
  | { kind: 'error'; message: string }

/**
 * Реактивный статус загрузки модели (для UI-баннера и переключателя).
 */
export function useEmbeddingStatus(active: boolean): EmbeddingStatus {
  const [status, setStatus] = useState<EmbeddingStatus>(getEmbeddingClient().getStatus())
  useEffect(() => {
    if (!active) return
    const client = getEmbeddingClient()
    const unsub = client.subscribe(setStatus)
    client.init()
    return unsub
  }, [active])
  return status
}

/**
 * Строится семантический индекс из переданных документов.
 * Перестраивается, если меняется массив docs (по сигнатуре идентификаторов).
 */
export function useSemanticIndex(
  docs: SearchDoc[] | null,
  enabled: boolean,
): { state: IndexState; index: IndexedItem[] } {
  // internalState/index обновляются только из асинхронных коллбэков builIndex.
  // Видимое наружу состояние «выключено / нет документов» выводится из props.
  const [internalState, setInternalState] = useState<IndexState>({ kind: 'idle' })
  const [internalIndex, setInternalIndex] = useState<IndexedItem[]>([])

  const sig = useMemo(() => {
    if (!docs) return ''
    return docs.map((d) => `${d.type}:${d.id}:${d.text.length}`).join('|')
  }, [docs])

  useEffect(() => {
    if (!enabled || !docs) return
    const controller = new AbortController()
    buildIndex(docs, {
      signal: controller.signal,
      onProgress: (p) =>
        setInternalState({ kind: 'building', encoded: p.encoded, total: p.total, fromCache: p.fromCache }),
    })
      .then((res) => {
        if (controller.signal.aborted) return
        setInternalIndex(res.items)
        setInternalState({
          kind: 'ready',
          size: res.items.length,
          fromCache: res.fromCache,
          newlyEncoded: res.newlyEncoded,
        })
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        const message = e instanceof Error ? e.message : String(e)
        setInternalState({ kind: 'error', message })
      })
    return () => controller.abort()
  }, [sig, enabled, docs])

  if (!enabled || !docs) return { state: { kind: 'idle' }, index: [] }
  return { state: internalState, index: internalIndex }
}

/**
 * Дебаунсированный семантический поиск по индексу.
 */
export function useSemanticQuery(
  query: string,
  index: IndexedItem[],
  enabled: boolean,
  opts?: { topK?: number; minScore?: number; debounceMs?: number },
): SearchState {
  // internalState обновляется только из таймера и асинхронных коллбэков.
  // Условие «idle» (нет запроса / выключено) выведено наружу через проверку ниже.
  const [internalState, setInternalState] = useState<SearchState>({ kind: 'idle' })
  const reqIdRef = useRef(0)
  const debounceMs = opts?.debounceMs ?? 200

  const q = query.trim()
  const queryReady = enabled && q.length >= 2 && index.length > 0

  useEffect(() => {
    if (!queryReady) return
    const myId = ++reqIdRef.current
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setInternalState({ kind: 'searching' })
      semanticSearch(q, index, { topK: opts?.topK, minScore: opts?.minScore, signal: controller.signal })
        .then((hits) => {
          if (myId !== reqIdRef.current) return
          setInternalState({ kind: 'done', hits })
        })
        .catch((e: unknown) => {
          if (myId !== reqIdRef.current) return
          if (controller.signal.aborted) return
          const message = e instanceof Error ? e.message : String(e)
          setInternalState({ kind: 'error', message })
        })
    }, debounceMs)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [q, queryReady, index, opts?.topK, opts?.minScore, debounceMs])

  if (!queryReady) return { kind: 'idle' }
  return internalState
}
