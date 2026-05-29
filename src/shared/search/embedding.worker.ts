/// <reference lib="webworker" />
import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers'
import type { WorkerInbound, WorkerOutbound } from './types'

const ctx = self as unknown as DedicatedWorkerGlobalScope

// Запрещаем поиск моделей в локальной директории — иначе Transformers.js пытается дергать /models/...
env.allowLocalModels = false
env.allowRemoteModels = true

let pipePromise: Promise<FeatureExtractionPipeline> | null = null

function post(msg: WorkerOutbound) {
  ctx.postMessage(msg)
}

async function getPipe(modelId: string): Promise<FeatureExtractionPipeline> {
  if (pipePromise) return pipePromise
  pipePromise = (async () => {
    const pipe = (await pipeline('feature-extraction', modelId, {
      progress_callback: (p: unknown) => {
        const data = p as { status?: string; file?: string; loaded?: number; total?: number; progress?: number }
        post({
          kind: 'progress',
          phase: String(data.status ?? 'progress'),
          loaded: data.loaded,
          total: data.total,
          file: data.file,
        })
      },
    })) as FeatureExtractionPipeline
    post({ kind: 'ready' })
    return pipe
  })()
  return pipePromise
}

ctx.addEventListener('message', async (ev: MessageEvent<WorkerInbound>) => {
  const msg = ev.data
  try {
    if (msg.kind === 'init') {
      await getPipe(msg.modelId)
      return
    }
    if (msg.kind === 'embed') {
      const pipe = await getPipe('Xenova/paraphrase-multilingual-MiniLM-L12-v2')
      const inputs = msg.texts.map((t) => (t ?? '').slice(0, 4000))
      const out = await pipe(inputs, { pooling: 'mean', normalize: true })
      // out — Tensor [batch, dim]. dims: [B, D], data: Float32Array длиной B*D.
      const data = out.data as Float32Array
      const dims = out.dims as number[]
      const dim = dims[dims.length - 1]
      const batch = data.length / dim
      const vectors: Float32Array[] = []
      for (let i = 0; i < batch; i++) {
        vectors.push(new Float32Array(data.buffer, data.byteOffset + i * dim * 4, dim).slice())
      }
      // Передаём векторы как transferable — ускорит передачу больших батчей.
      // .slice() выше выделил собственный ArrayBuffer, безопасно его передавать.
      const transfers = vectors.map((v) => v.buffer as ArrayBuffer)
      ctx.postMessage({ kind: 'embed-result', reqId: msg.reqId, vectors, dim }, transfers)
      return
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    post({ kind: 'error', reqId: msg.kind === 'embed' ? msg.reqId : undefined, message })
  }
})

export {}
