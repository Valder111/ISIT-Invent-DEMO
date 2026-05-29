import axios, { type AxiosInstance, type AxiosResponse, isAxiosError } from 'axios'
import type { ResponseResponse } from './generated/data-contracts'
import { ApiError, messageFromAxiosError } from './http'
import type { ApiMeta } from './types'

const JSON_CONTENT = 'application/json'

function isApiEnvelope(data: unknown): data is ResponseResponse {
  return typeof data === 'object' && data !== null && 'success' in data
}

function envelopeToApiError(payload: ResponseResponse | undefined, status?: number): ApiError {
  return new ApiError(payload?.error?.message ?? 'Ошибка запроса', {
    code: payload?.error?.code,
    field: payload?.error?.field,
    status,
  })
}

function applyEnvelopeError(payload: ResponseResponse, status?: number): void {
  if (!payload.success) {
    throw envelopeToApiError(payload, status)
  }
}

/** Общий axios для API (демо: относительные /api/* перехватывает MSW). */
export function createApiAxiosInstance(): AxiosInstance {
  return buildApiAxiosInstance()
}

function buildApiAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: '',
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
        return response
      }

      const contentType = String(response.headers['content-type'] ?? '')
      if (!contentType.includes(JSON_CONTENT) && !isApiEnvelope(response.data)) {
        return response
      }

      const payload = response.data
      if (isApiEnvelope(payload)) {
        applyEnvelopeError(payload, response.status)
      }

      return response
    },
    (error: unknown) => {
      if (!isAxiosError(error)) throw error

      const status = error.response?.status
      const data = error.response?.data
      if (isApiEnvelope(data)) {
        throw envelopeToApiError(data, status)
      }

      throw new ApiError(messageFromAxiosError(error), { status })
    },
  )

  return instance
}

/** Singleton: все API-вызовы и кэш используют один instance. */
export const apiAxios = buildApiAxiosInstance()

export function unwrapEnvelopeData<T>(response: AxiosResponse<ResponseResponse>): T {
  const payload = response.data
  applyEnvelopeError(payload, response.status)
  return payload.data as T
}

export function unwrapEnvelopeWithMeta<T>(response: AxiosResponse<ResponseResponse>): { data: T; meta?: ApiMeta } {
  const payload = response.data
  applyEnvelopeError(payload, response.status)

  const meta: ApiMeta | undefined = payload.meta
    ? {
        page: payload.meta.page,
        limit: payload.meta.limit,
        total: payload.meta.total,
        calculated: payload.meta.calculated,
        cache: payload.meta.cache === 'hit' || payload.meta.cache === 'miss' ? payload.meta.cache : undefined,
      }
    : undefined

  const xCache = response.headers['x-cache']?.toLowerCase()
  if (xCache === 'hit' || xCache === 'miss') {
    return { data: payload.data as T, meta: { ...meta, cache: xCache } }
  }

  return { data: payload.data as T, meta }
}
