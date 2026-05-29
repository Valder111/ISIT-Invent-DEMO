import { HttpResponse } from 'msw'
import { fail, ok, type ApiMeta } from '../httpEnvelope'
import { ServiceError } from '../demoService/errors'

export function json(data: unknown, init?: ResponseInit) {
  return HttpResponse.json(data as never, init)
}

export function jsonOk<T>(data: T, meta?: ApiMeta, init?: ResponseInit) {
  return json(ok(data, meta), init)
}

export function jsonErr(err: ServiceError) {
  return json(fail(err.message, { code: err.code, field: err.field }), { status: err.status })
}

export function handleService<T>(fn: () => T) {
  try {
    return jsonOk(fn())
  } catch (e) {
    if (e instanceof ServiceError) return jsonErr(e)
    throw e
  }
}

export async function handleServiceAsync<T>(fn: () => Promise<T>) {
  try {
    const data = await fn()
    return jsonOk(data)
  } catch (e) {
    if (e instanceof ServiceError) return jsonErr(e)
    throw e
  }
}
