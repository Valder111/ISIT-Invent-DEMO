export class ServiceError extends Error {
  status: number
  code?: string
  field?: string

  constructor(message: string, status: number, opts?: { code?: string; field?: string }) {
    super(message)
    this.name = 'ServiceError'
    this.status = status
    this.code = opts?.code
    this.field = opts?.field
  }
}

export function unauthorized(msg = 'Войдите в систему') {
  return new ServiceError(msg, 401)
}

export function forbidden(msg = 'У вас нет доступа к этому действию') {
  return new ServiceError(msg, 403)
}

export function notFound(msg = 'Данные не найдены', field?: string) {
  return new ServiceError(msg, 404, { code: 'NOT_FOUND', field })
}

export function badRequest(msg: string, field?: string, code = 'VALIDATION_ERROR') {
  return new ServiceError(msg, 400, { code, field })
}

export function conflict(msg: string, code?: string, field?: string) {
  return new ServiceError(msg, 409, { code, field })
}
