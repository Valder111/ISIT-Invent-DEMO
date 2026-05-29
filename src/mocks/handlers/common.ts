import { fail } from '../httpEnvelope'
import { currentMe } from '../mockDb'
import type { MeResponse } from '../../shared/api/auth'
import { json } from './respond'

export function requireAuth():
  | { ok: true; me: MeResponse }
  | { ok: false; response: ReturnType<typeof json> } {
  const me = currentMe()
  if (!me) return { ok: false, response: json(fail('Войдите в систему'), { status: 401 }) }
  return { ok: true, me }
}
