import type { AxiosError } from 'axios'

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Некорректные данные. Проверьте введённые поля',
  401: 'Войдите в систему',
  403: 'У вас нет доступа к этому действию',
  404: 'Данные не найдены',
  408: 'Сервер не ответил вовремя. Попробуйте ещё раз',
  409: 'Действие невозможно из‑за конфликта данных',
  429: 'Слишком много запросов. Подождите и повторите',
  500: 'На сервере произошла ошибка. Попробуйте позже',
  502: 'Сервер временно недоступен. Попробуйте позже',
  503: 'Сервис временно недоступен. Попробуйте позже',
  504: 'Сервер не ответил вовремя. Попробуйте ещё раз',
}

function messageForHttpStatus(status: number): string {
  return HTTP_STATUS_MESSAGES[status] ?? 'Не удалось выполнить запрос. Попробуйте позже'
}

/** Человекочитаемое сообщение вместо английских текстов axios (`Request failed…`, `Network Error`). */
export function messageFromAxiosError(error: AxiosError): string {
  const status = error.response?.status
  if (status !== undefined) {
    return messageForHttpStatus(status)
  }

  const code = error.code
  if (code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Не удалось связаться с сервером. Проверьте интернет и попробуйте снова'
  }
  if (code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
    return 'Сервер не ответил вовремя. Попробуйте ещё раз'
  }
  if (code === 'ERR_CANCELED') {
    return 'Запрос отменён.'
  }

  const axiosStatus = error.message.match(/^Request failed with status code (\d+)$/)
  if (axiosStatus) {
    return messageForHttpStatus(Number(axiosStatus[1]))
  }

  return 'Не удалось связаться с сервером. Попробуйте позже'
}

/** Ошибка API (используется axios-интерцептором и UI). */
export class ApiError extends Error {
  code?: string
  field?: string
  status?: number

  constructor(message: string, opts?: { code?: string; field?: string; status?: number }) {
    super(message)
    this.name = 'ApiError'
    this.code = opts?.code
    this.field = opts?.field
    this.status = opts?.status
  }
}

function translateKnownApiMessage(message: string): string {
  const axiosStatus = message.match(/^Request failed with status code (\d+)$/)
  if (axiosStatus) return messageForHttpStatus(Number(axiosStatus[1]))
  if (message === 'Network Error') {
    return 'Не удалось связаться с сервером. Проверьте интернет и попробуйте снова'
  }
  if (/^HTTP \d+/.test(message)) {
    const status = Number(message.replace(/^HTTP (\d+).*/, '$1'))
    if (!Number.isNaN(status)) return messageForHttpStatus(status)
  }
  return message
}

/** Сообщение для UI: ApiError, rejectWithValue payload или SerializedError из `.unwrap()`. */
export function getErrorMessage(err: unknown, fallback = 'Неизвестная ошибка'): string {
  if (err instanceof ApiError) {
    const text = translateKnownApiMessage(err.message)
    return err.field ? `${text} (поле: ${err.field})` : text
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const raw = (err as { message: unknown }).message
    if (typeof raw === 'string' && raw.length > 0) {
      const message = translateKnownApiMessage(raw)
      const field = 'field' in err ? (err as { field?: unknown }).field : undefined
      return typeof field === 'string' && field.length > 0 ? `${message} (поле: ${field})` : message
    }
  }
  return fallback
}
