export type ApiErrorPayload = {
  code: string
  message: string
  field?: string
}

export type ApiMeta = {
  page?: number
  limit?: number
  total?: number
  calculated?: number
  /** Серверный Redis-кэш: hit | miss (GET). */
  cache?: 'hit' | 'miss'
}

export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: ApiErrorPayload
  meta?: ApiMeta
}

