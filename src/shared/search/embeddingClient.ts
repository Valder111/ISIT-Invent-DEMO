import { SEMANTIC_MODEL_ID, type WorkerInbound, type WorkerOutbound } from './types'

export type EmbeddingStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; progress: number; file?: string }
  | { kind: 'ready' }
  | { kind: 'error'; message: string }

type PendingEmbed = {
  resolve: (vectors: Float32Array[]) => void
  reject: (err: Error) => void
}

class EmbeddingClient {
  private worker: Worker | null = null
  private status: EmbeddingStatus = { kind: 'idle' }
  private listeners = new Set<(s: EmbeddingStatus) => void>()
  private pending = new Map<number, PendingEmbed>()
  private nextReqId = 1
  private filesProgress = new Map<string, { loaded: number; total: number }>()

  getStatus(): EmbeddingStatus {
    return this.status
  }

  subscribe(fn: (s: EmbeddingStatus) => void): () => void {
    this.listeners.add(fn)
    fn(this.status)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private setStatus(s: EmbeddingStatus) {
    this.status = s
    for (const l of this.listeners) l(s)
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker
    this.worker = new Worker(new URL('./embedding.worker.ts', import.meta.url), {
      type: 'module',
      name: 'semantic-embedding-worker',
    })
    this.worker.addEventListener('message', (ev: MessageEvent<WorkerOutbound>) => {
      const msg = ev.data
      if (msg.kind === 'progress') {
        if (msg.file && typeof msg.loaded === 'number' && typeof msg.total === 'number' && msg.total > 0) {
          this.filesProgress.set(msg.file, { loaded: msg.loaded, total: msg.total })
        }
        let loaded = 0
        let total = 0
        for (const v of this.filesProgress.values()) {
          loaded += v.loaded
          total += v.total
        }
        const progress = total > 0 ? loaded / total : 0
        this.setStatus({ kind: 'loading', progress, file: msg.file })
        return
      }
      if (msg.kind === 'ready') {
        this.setStatus({ kind: 'ready' })
        return
      }
      if (msg.kind === 'embed-result') {
        const p = this.pending.get(msg.reqId)
        if (p) {
          this.pending.delete(msg.reqId)
          p.resolve(msg.vectors)
        }
        return
      }
      if (msg.kind === 'error') {
        if (typeof msg.reqId === 'number') {
          const p = this.pending.get(msg.reqId)
          if (p) {
            this.pending.delete(msg.reqId)
            p.reject(new Error(msg.message))
            return
          }
        }
        this.setStatus({ kind: 'error', message: msg.message })
      }
    })
    this.worker.addEventListener('error', (e) => {
      this.setStatus({ kind: 'error', message: e.message || 'Worker error' })
    })
    return this.worker
  }

  init(): void {
    const w = this.ensureWorker()
    if (this.status.kind === 'idle') {
      this.setStatus({ kind: 'loading', progress: 0 })
      const msg: WorkerInbound = { kind: 'init', modelId: SEMANTIC_MODEL_ID }
      w.postMessage(msg)
    }
  }

  async embed(texts: string[]): Promise<Float32Array[]> {
    if (texts.length === 0) return []
    const w = this.ensureWorker()
    if (this.status.kind === 'idle') this.init()
    const reqId = this.nextReqId++
    return new Promise<Float32Array[]>((resolve, reject) => {
      this.pending.set(reqId, { resolve, reject })
      const msg: WorkerInbound = { kind: 'embed', reqId, texts }
      w.postMessage(msg)
    })
  }
}

let singleton: EmbeddingClient | null = null

export function getEmbeddingClient(): EmbeddingClient {
  if (!singleton) singleton = new EmbeddingClient()
  return singleton
}

export type { EmbeddingClient }
