export type ApiMeta = {
  page?: number
  limit?: number
  total?: number
  calculated?: boolean
  cache?: 'hit' | 'miss'
}

export type ApiEnvelope<T> =
  | { success: true; data: T; meta?: ApiMeta }
  | { success: false; error: { message: string; code?: string; field?: string } }

export function ok<T>(data: T, meta?: ApiMeta): ApiEnvelope<T> {
  return meta ? { success: true, data, meta } : { success: true, data }
}

export function fail(message: string, opts?: { code?: string; field?: string }): ApiEnvelope<never> {
  return { success: false, error: { message, code: opts?.code, field: opts?.field } }
}

