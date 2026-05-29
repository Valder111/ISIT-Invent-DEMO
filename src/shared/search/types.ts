export const SEMANTIC_MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'
export const SEMANTIC_MODEL_VER = 'paraphrase-multilingual-MiniLM-L12-v2@v1'
export const EMBEDDING_DIM = 384

export type EntityType = 'category' | 'model' | 'instance'

export type SearchDoc = {
  type: EntityType
  id: number
  text: string
}

export type SearchHit = {
  type: EntityType
  id: number
  score: number
}

export type WorkerInbound =
  | { kind: 'init'; modelId: string }
  | { kind: 'embed'; reqId: number; texts: string[] }

export type WorkerOutbound =
  | { kind: 'progress'; phase: string; loaded?: number; total?: number; file?: string }
  | { kind: 'ready' }
  | { kind: 'embed-result'; reqId: number; vectors: Float32Array[]; dim: number }
  | { kind: 'error'; reqId?: number; message: string }
