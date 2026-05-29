import { http, HttpResponse } from 'msw'
import { fail, ok } from '../httpEnvelope'
import { instanceMatchesStatusFilter } from '../demoService/equipmentStatus'
import { addTicketItem } from '../demoService/ticketItems'
import { createWriteOff } from '../demoService/writeoffs'
import { appendActivity } from '../demoService/utils'
import {
  enrichInstance,
  enrichModel,
  enrichTicket,
  filterTicketsForList,
  ticketVisibleTo,
} from '../demoService/helpers'
import { hydrateImgList } from '../hydrate'
import { ServiceError } from '../demoService/errors'
import { currentMe, getDb, listUsers, loginByCredentials, logout, patchMe, setDb } from '../mockDb'

function json(data: unknown, init?: ResponseInit) {
  return HttpResponse.json(data as never, init)
}

function requireAuth() {
  const me = currentMe()
  if (!me) return { ok: false as const, response: json(fail('Войдите в систему'), { status: 401 }) }
  return { ok: true as const, me }
}

function nowIso() {
  return new Date().toISOString()
}

function nextId(items: Array<{ id: number }>) {
  return (items.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1
}

function parseNumber(v: string | undefined): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export const routeHandlers = [
  http.get('/api/health', () => {
    return json(ok({ status: 'ok' }))
  }),

  // --- Auth / Users ---
  http.post('/api/users/auth', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { login?: string; password?: string } | null
    const login = body?.login ?? ''
    const password = body?.password ?? ''

    const res = loginByCredentials(String(login), String(password))
    if (!res.ok) {
      return json(fail('Неверный логин или пароль', { code: 'INVALID_CREDENTIALS' }), { status: 401 })
    }

    // серверный контракт: success без data (затем UI делает /me)
    return json(ok({}))
  }),

  http.post('/api/users/logout', () => {
    logout()
    return json(ok({}))
  }),

  http.get('/api/users/me', () => {
    const me = currentMe()
    if (!me) return json(fail('Войдите в систему'), { status: 401 })
    return json(ok(me))
  }),

  http.patch('/api/users/me', async ({ request }) => {
    const me = currentMe()
    if (!me) return json(fail('Войдите в систему'), { status: 401 })

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const updated = patchMe({
      username: typeof body?.username === 'string' ? body.username : undefined,
      email: typeof body?.email === 'string' ? body.email : undefined,
      img: typeof body?.img === 'string' ? body.img : undefined,
      img_url: typeof body?.img_url === 'string' ? body.img_url : undefined,
      comment: typeof body?.comment === 'string' ? body.comment : undefined,
      is_active: typeof body?.is_active === 'boolean' ? body.is_active : undefined,
    })

    if (!updated) return json(fail('Пользователь не найден'), { status: 404 })
    return json(ok(updated))
  }),

  http.get('/api/users', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    return json(ok(listUsers()))
  }),

  // --- Types ---
  http.get('/api/types', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    return json(ok(hydrateImgList(getDb().types)))
  }),
  http.get('/api/types/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const item = id != null ? getDb().types.find((x) => x.id === id) : undefined
    if (!item) return json(fail('Данные не найдены'), { status: 404 })
    return json(ok(hydrateImgList([item])[0]))
  }),
  http.post('/api/types', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      name: string
      description: string
      img: string
      comment: string
      is_active: boolean
    }> | null
    if (!body?.name?.trim()) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'name' }), { status: 400 })
    const id = nextId(db.types)
    const item = {
      id,
      name: body.name.trim(),
      description: body.description ?? '',
      img: body.img ?? '',
      img_url: body.img ? `/static/images/placeholders/type_peripheral.svg` : undefined,
      comment: body.comment ?? '',
      is_active: body.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    setDb({ ...db, types: [item, ...db.types] })
    return json(ok(item))
  }),
  http.put('/api/types/:id', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.types.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.types[idx]
    const updated = {
      ...cur,
      name: typeof body?.name === 'string' ? body.name : cur.name,
      description: typeof body?.description === 'string' ? body.description : cur.description,
      img: typeof body?.img === 'string' ? body.img : cur.img,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      is_active: typeof body?.is_active === 'boolean' ? body.is_active : cur.is_active,
      updated_at: nowIso(),
    }
    const next = db.types.slice()
    next[idx] = updated
    setDb({ ...db, types: next })
    return json(ok(updated))
  }),
  http.delete('/api/types/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    if (id == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({ ...db, types: db.types.filter((x) => x.id !== id) })
    return json(ok({ message: 'deleted', id }))
  }),

  // --- Models ---
  http.get('/api/models', ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const typeId = parseNumber(url.searchParams.get('type_id') ?? undefined)
    const consumable = url.searchParams.get('consumable')
    const db = getDb()
    let rows = db.models.slice()
    if (typeId != null) rows = rows.filter((m) => m.type_id === typeId)
    if (consumable === 'true' || consumable === '1') rows = rows.filter((m) => m.is_consumable)
    if (consumable === 'false' || consumable === '0') rows = rows.filter((m) => !m.is_consumable)
    return json(ok(rows.map((m) => enrichModel(db, m))))
  }),
  http.get('/api/models/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const m = id != null ? db.models.find((x) => x.id === id) : undefined
    if (!m) return json(fail('Данные не найдены'), { status: 404 })
    return json(ok(enrichModel(db, m)))
  }),
  http.post('/api/models', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      type_id: number
      name: string
      description: string
      is_consumable: boolean
      count: number
      img: string
      comment: string
      is_active: boolean
    }> | null
    if (!body?.name?.trim()) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'name' }), { status: 400 })
    if (typeof body?.type_id !== 'number') return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'type_id' }), { status: 400 })
    const id = nextId(db.models)
    const item = {
      id,
      type_id: body.type_id,
      name: body.name.trim(),
      description: body.description ?? '',
      is_consumable: body.is_consumable ?? false,
      count: body.count ?? 0,
      img: body.img ?? '',
      img_url: '/static/images/placeholders/model_pc.svg',
      comment: body.comment ?? '',
      is_active: body.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    setDb({ ...db, models: [item, ...db.models] })
    return json(ok({ ...item, type: db.types.find((t) => t.id === item.type_id) }))
  }),
  http.put('/api/models/:id', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.models.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.models[idx]
    const updated = {
      ...cur,
      type_id: typeof body?.type_id === 'number' ? body.type_id : cur.type_id,
      name: typeof body?.name === 'string' ? body.name : cur.name,
      description: typeof body?.description === 'string' ? body.description : cur.description,
      is_consumable: typeof body?.is_consumable === 'boolean' ? body.is_consumable : cur.is_consumable,
      count: typeof body?.count === 'number' ? body.count : cur.count,
      img: typeof body?.img === 'string' ? body.img : cur.img,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      is_active: typeof body?.is_active === 'boolean' ? body.is_active : cur.is_active,
      updated_at: nowIso(),
    }
    const next = db.models.slice()
    next[idx] = updated
    setDb({ ...db, models: next })
    return json(ok({ ...updated, type: db.types.find((t) => t.id === updated.type_id) }))
  }),
  http.delete('/api/models/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    if (id == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({ ...db, models: db.models.filter((x) => x.id !== id) })
    return json(ok({ message: 'deleted', id }))
  }),

  // --- Locations ---
  http.get('/api/locations', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    return json(ok(getDb().locations))
  }),
  http.get('/api/locations/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const item = id != null ? getDb().locations.find((x) => x.id === id) : undefined
    if (!item) return json(fail('Данные не найдены'), { status: 404 })
    return json(ok(item))
  }),

  // --- Equipment instances ---
  http.get('/api/equipment', ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const category = url.searchParams.get('category')
    const locationId = parseNumber(url.searchParams.get('location_id') ?? undefined)
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase()
    const includeInactive = url.searchParams.get('include_inactive') === '1' || url.searchParams.get('include_inactive') === 'true'

    const db = getDb()
    let rows = db.instances.slice()
    if (status) rows = rows.filter((x) => instanceMatchesStatusFilter(x.status, status))
    if (locationId != null) rows = rows.filter((x) => (x.location_id ?? null) === locationId)
    if (search) {
      rows = rows.filter((x) => `${x.name} ${x.description} ${x.invent_number} ${x.factory_number ?? ''}`.toLowerCase().includes(search))
    }
    if (!includeInactive) rows = rows.filter((x) => x.is_active !== false)

    let withRefs = rows.map((i) => enrichInstance(db, i))
    if (category) {
      withRefs = withRefs.filter((x) => x.model?.type?.name?.toLowerCase().includes(category.toLowerCase()))
    }
    return json(ok(withRefs))
  }),
  http.get('/api/equipment/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const i = id != null ? db.instances.find((x) => x.id === id) : undefined
    if (!i) return json(fail('Данные не найдены'), { status: 404 })
    return json(ok(enrichInstance(db, i)))
  }),
  http.get('/api/equipment/qr/:token', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const token = String(params.token ?? '')
    const db = getDb()
    const i = db.instances.find((x) => x.qr_token === token)
    if (!i) return json(fail('Данные не найдены'), { status: 404 })
    return json(ok(enrichInstance(db, i)))
  }),

  // --- Tickets ---
  http.get('/api/tickets', ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? undefined
    const authorId = parseNumber(url.searchParams.get('author_id') ?? undefined)
    const laborantId = parseNumber(url.searchParams.get('laborant_id') ?? undefined)
    const type = url.searchParams.get('type') ?? undefined
    const panel = url.searchParams.get('panel') === '1' || url.searchParams.get('panel') === 'true'

    const db = getDb()
    const list = filterTicketsForList(auth.me, db.tickets, {
      status,
      author_id: authorId ?? undefined,
      laborant_id: laborantId ?? undefined,
      type,
      panel,
    })
    return json(ok(list))
  }),
  http.get('/api/tickets/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const t = id != null ? db.tickets.find((x) => x.id === id) : undefined
    if (!t) return json(fail('Данные не найдены'), { status: 404 })
    if (!ticketVisibleTo(auth.me, t)) return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    return json(ok(enrichTicket(db, t, true)))
  }),
  http.post('/api/tickets', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      type: string
      name: string
      description: string
      comment: string
    }> | null
    if (!body?.name?.trim()) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'name' }), { status: 400 })
    const id = nextId(db.tickets)
    const ticket = {
      id,
      author_id: auth.me.id,
      laborant_id: null,
      type: body.type ?? 'hardware',
      status: 'draft',
      name: body.name.trim(),
      description: body.description ?? '',
      comment: body.comment ?? '',
      cancel_reason: '',
      is_active: true,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    setDb({ ...db, tickets: [ticket, ...db.tickets] })
    appendActivity({
      type: 'ticket',
      entity_type: 'ticket',
      entity_id: id,
      user_id: auth.me.id,
      activity: 'create',
      comment: `Создана заявка: ${ticket.name}`,
      created_at: nowIso(),
    })
    return json(ok(ticket))
  }),
  http.put('/api/tickets/:id', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.tickets.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.tickets[idx]
    const updated = {
      ...cur,
      name: typeof body?.name === 'string' ? body.name : cur.name,
      description: typeof body?.description === 'string' ? body.description : cur.description,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      type: typeof body?.type === 'string' ? body.type : cur.type,
      updated_at: nowIso(),
    }
    const next = db.tickets.slice()
    next[idx] = updated
    setDb({ ...db, tickets: next })
    return json(ok(updated))
  }),
  http.delete('/api/tickets/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    if (id == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({ ...db, tickets: db.tickets.filter((x) => x.id !== id), ticketItems: db.ticketItems.filter((x) => x.ticket_id !== id) })
    return json(ok({ message: 'deleted', ticket_id: id }))
  }),
  http.put('/api/tickets/:id/form', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.tickets.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const cur = db.tickets[idx]
    if (cur.author_id !== auth.me.id) return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    if (cur.status !== 'draft') return json(fail('Действие невозможно из‑за конфликта данных', { code: 'INVALID_STATUS' }), { status: 409 })

    // Как на сервере: draft -> in_progress (без исполнителя).
    const updated = { ...cur, status: 'in_progress', laborant_id: null, updated_at: nowIso() }
    const next = db.tickets.slice()
    next[idx] = updated
    setDb({ ...db, tickets: next })
    appendActivity({
      type: 'ticket',
      entity_type: 'ticket',
      entity_id: id,
      user_id: auth.me.id,
      activity: 'form',
      comment: `Заявка #${id} отправлена в работу`,
      created_at: nowIso(),
    })
    return json(ok(updated))
  }),
  http.put('/api/tickets/:id/accept', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.tickets.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const cur = db.tickets[idx]
    const updated = { ...cur, status: 'in_progress', laborant_id: auth.me.id, updated_at: nowIso() }
    const next = db.tickets.slice()
    next[idx] = updated
    setDb({ ...db, tickets: next })
    appendActivity({
      type: 'ticket',
      entity_type: 'ticket',
      entity_id: id,
      user_id: auth.me.id,
      activity: 'accept',
      comment: `Заявка #${id} принята лаборантом`,
      created_at: nowIso(),
    })
    return json(ok(updated))
  }),
  http.put('/api/tickets/:id/complete', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.tickets.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const cur = db.tickets[idx]
    const updated = { ...cur, status: 'done', updated_at: nowIso() }
    const next = db.tickets.slice()
    next[idx] = updated
    setDb({ ...db, tickets: next })
    return json(ok({ message: 'completed', ticket_id: id }))
  }),
  http.put('/api/tickets/:id/reject', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.tickets.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as { cancel_reason?: string } | null
    const cur = db.tickets[idx]
    const updated = { ...cur, status: 'cancelled', cancel_reason: body?.cancel_reason ?? 'Отклонено', updated_at: nowIso() }
    const next = db.tickets.slice()
    next[idx] = updated
    setDb({ ...db, tickets: next })
    return json(ok({ message: 'rejected' }))
  }),
  http.put('/api/tickets/:id/cancel', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.tickets.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as { cancel_reason?: string } | null
    const cur = db.tickets[idx]
    const updated = { ...cur, status: 'cancelled', cancel_reason: body?.cancel_reason ?? 'Отменено', updated_at: nowIso() }
    const next = db.tickets.slice()
    next[idx] = updated
    setDb({ ...db, tickets: next })
    return json(ok({ message: 'cancelled', ticket_id: id }))
  }),

  // Ticket items (two route variants in generated client)
  http.post('/api/tickets/:id/items', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    if (ticketId == null) return json(fail('Некорректные данные'), { status: 400 })
    const body = (await request.json().catch(() => null)) as Partial<{
      model_id: number
      instance_id: number | null
      quantity: number
      comment: string
    }> | null
    try {
      const item = addTicketItem(auth.me, ticketId, body ?? {})
      return json(ok(item))
    } catch (e) {
      if (e instanceof ServiceError) {
        return json(fail(e.message, { code: e.code, field: e.field }), { status: e.status })
      }
      throw e
    }
  }),
  http.delete('/api/tickets/:id/items/by-id/:itemId', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const itemId = parseNumber(String(params.itemId))
    if (ticketId == null || itemId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    setDb({ ...db, ticketItems: db.ticketItems.filter((x) => !(x.ticket_id === ticketId && x.id === itemId)) })
    return json(ok({}))
  }),
  http.put('/api/tickets/:id/items/by-id/:itemId', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const itemId = parseNumber(String(params.itemId))
    if (ticketId == null || itemId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const idx = db.ticketItems.findIndex((x) => x.ticket_id === ticketId && x.id === itemId)
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.ticketItems[idx]
    const updated = {
      ...cur,
      quantity: typeof body?.quantity === 'number' ? body.quantity : cur.quantity,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      instance_id: typeof body?.instance_id === 'number' ? body.instance_id : body?.instance_id === null ? null : cur.instance_id,
      updated_at: nowIso(),
    }
    const next = db.ticketItems.slice()
    next[idx] = updated
    setDb({ ...db, ticketItems: next })
    return json(ok(updated))
  }),

  // --- Documents ---
  http.get('/api/docs', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const rows = db.documents.map((d) => ({
      ...d,
      uploaded_by: (() => {
        const u = d.uploaded_by_id != null ? db.users.find((x) => x.id === d.uploaded_by_id) : undefined
        return u ? { id: u.id, username: u.username, email: u.email } : null
      })(),
    }))
    return json(ok(rows))
  }),

  // Entity documents: equipment instance
  http.get('/api/equipment/:id/docs', ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const instanceId = parseNumber(String(params.id))
    const db = getDb()
    if (instanceId == null) return json(fail('Некорректные данные'), { status: 400 })
    const url = new URL(request.url)
    const publicOnly = url.searchParams.get('public') === '1' || url.searchParams.get('public') === 'true'
    const rows = db.documents
      .filter((d) => d.instance_id === instanceId)
      .filter((d) => (publicOnly ? d.is_public : true))
      .map((d) => ({
        ...d,
        uploaded_by: (() => {
          const u = d.uploaded_by_id != null ? db.users.find((x) => x.id === d.uploaded_by_id) : undefined
          return u ? { id: u.id, username: u.username, email: u.email } : null
        })(),
      }))
    return json(ok(rows))
  }),
  http.post('/api/equipment/:id/docs', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const instanceId = parseNumber(String(params.id))
    if (instanceId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      object_key: string
      filename: string
      content_type: string
      size: number
      is_public: boolean
      comment: string
    }> | null
    if (!body?.object_key || !body?.filename) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'object_key' }), { status: 400 })
    const id = nextId(db.documents)
    const doc = {
      id,
      ticket_id: null,
      model_id: null,
      instance_id: instanceId,
      object_key: body.object_key,
      filename: body.filename,
      content_type: body.content_type ?? 'application/octet-stream',
      size: body.size ?? 0,
      is_public: body.is_public ?? true,
      uploaded_by_id: auth.me.id,
      comment: body.comment ?? '',
      created_at: nowIso(),
      url: '/static/images/placeholders/document.svg',
    }
    setDb({ ...db, documents: [doc, ...db.documents] })
    return json(ok(doc))
  }),
  http.delete('/api/equipment/:id/docs/:docId', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const instanceId = parseNumber(String(params.id))
    const docId = parseNumber(String(params.docId))
    if (instanceId == null || docId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    setDb({ ...db, documents: db.documents.filter((d) => !(d.instance_id === instanceId && d.id === docId)) })
    return json(ok({}))
  }),
  http.patch('/api/equipment/:id/docs/:docId', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const instanceId = parseNumber(String(params.id))
    const docId = parseNumber(String(params.docId))
    if (instanceId == null || docId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const idx = db.documents.findIndex((d) => d.instance_id === instanceId && d.id === docId)
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.documents[idx]
    const updated = { ...cur, is_public: typeof body?.is_public === 'boolean' ? body.is_public : cur.is_public }
    const next = db.documents.slice()
    next[idx] = updated
    setDb({ ...db, documents: next })
    return json(ok(updated))
  }),

  // Entity documents: tickets
  http.get('/api/tickets/:id/docs', ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const db = getDb()
    if (ticketId == null) return json(fail('Некорректные данные'), { status: 400 })
    const url = new URL(request.url)
    const publicOnly = url.searchParams.get('public') === '1' || url.searchParams.get('public') === 'true'
    const rows = db.documents
      .filter((d) => d.ticket_id === ticketId)
      .filter((d) => (publicOnly ? d.is_public : true))
      .map((d) => ({
        ...d,
        uploaded_by: (() => {
          const u = d.uploaded_by_id != null ? db.users.find((x) => x.id === d.uploaded_by_id) : undefined
          return u ? { id: u.id, username: u.username, email: u.email } : null
        })(),
      }))
    return json(ok(rows))
  }),
  http.post('/api/tickets/:id/docs', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    if (ticketId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      object_key: string
      filename: string
      content_type: string
      size: number
      is_public: boolean
      comment: string
    }> | null
    if (!body?.object_key || !body?.filename) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'object_key' }), { status: 400 })
    const id = nextId(db.documents)
    const doc = {
      id,
      ticket_id: ticketId,
      model_id: null,
      instance_id: null,
      object_key: body.object_key,
      filename: body.filename,
      content_type: body.content_type ?? 'application/octet-stream',
      size: body.size ?? 0,
      is_public: body.is_public ?? true,
      uploaded_by_id: auth.me.id,
      comment: body.comment ?? '',
      created_at: nowIso(),
      url: '/static/images/placeholders/document.svg',
    }
    setDb({ ...db, documents: [doc, ...db.documents] })
    return json(ok(doc))
  }),
  http.delete('/api/tickets/:id/docs/:docId', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const docId = parseNumber(String(params.docId))
    if (ticketId == null || docId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    setDb({ ...db, documents: db.documents.filter((d) => !(d.ticket_id === ticketId && d.id === docId)) })
    return json(ok({}))
  }),
  http.patch('/api/tickets/:id/docs/:docId', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const docId = parseNumber(String(params.docId))
    if (ticketId == null || docId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const idx = db.documents.findIndex((d) => d.ticket_id === ticketId && d.id === docId)
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.documents[idx]
    const updated = { ...cur, is_public: typeof body?.is_public === 'boolean' ? body.is_public : cur.is_public }
    const next = db.documents.slice()
    next[idx] = updated
    setDb({ ...db, documents: next })
    return json(ok(updated))
  }),
  http.post('/api/docs', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      ticket_id: number | null
      model_id: number | null
      instance_id: number | null
      object_key: string
      filename: string
      content_type: string
      size: number
      is_public: boolean
      comment: string
    }> | null
    if (!body?.object_key || !body?.filename) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'object_key' }), { status: 400 })
    const id = nextId(db.documents)
    const doc = {
      id,
      ticket_id: typeof body.ticket_id === 'number' ? body.ticket_id : null,
      model_id: typeof body.model_id === 'number' ? body.model_id : null,
      instance_id: typeof body.instance_id === 'number' ? body.instance_id : null,
      object_key: body.object_key,
      filename: body.filename,
      content_type: body.content_type ?? 'application/octet-stream',
      size: body.size ?? 0,
      is_public: body.is_public ?? true,
      uploaded_by_id: auth.me.id,
      comment: body.comment ?? '',
      created_at: nowIso(),
      url: '/static/images/placeholders/document.svg',
    }
    setDb({ ...db, documents: [doc, ...db.documents] })
    return json(ok(doc))
  }),
  http.patch('/api/docs/:docId', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const docId = parseNumber(String(params.docId))
    const db = getDb()
    const idx = docId != null ? db.documents.findIndex((d) => d.id === docId) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.documents[idx]
    const updated = { ...cur, is_public: typeof body?.is_public === 'boolean' ? body.is_public : cur.is_public }
    const next = db.documents.slice()
    next[idx] = updated
    setDb({ ...db, documents: next })
    return json(ok(updated))
  }),
  http.delete('/api/docs/:docId', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const docId = parseNumber(String(params.docId))
    const db = getDb()
    if (docId == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({ ...db, documents: db.documents.filter((d) => d.id !== docId) })
    return json(ok({}))
  }),

  // --- Activity ---
  http.get('/api/activity', ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const limit = parseNumber(url.searchParams.get('limit') ?? undefined) ?? 50
    const offset = parseNumber(url.searchParams.get('offset') ?? undefined) ?? 0
    const type = url.searchParams.get('type')
    const db = getDb()
    let rows = db.activity.slice()
    if (type) rows = rows.filter((a) => a.type === type)
    const sliced = rows.slice(offset, offset + limit).map((a) => ({
      ...a,
      user: (() => {
        const u = a.user_id != null ? db.users.find((x) => x.id === a.user_id) : undefined
        return u ? { id: u.id, username: u.username, email: u.email } : null
      })(),
    }))
    return json(ok(sliced, { limit, page: Math.floor(offset / Math.max(1, limit)) + 1, total: rows.length, calculated: true }))
  }),

  // --- Writeoffs ---
  http.get('/api/writeoffs', ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const url = new URL(request.url)
    const limit = parseNumber(url.searchParams.get('limit') ?? undefined) ?? 50
    const offset = parseNumber(url.searchParams.get('offset') ?? undefined) ?? 0
    const db = getDb()
    const rows = db.writeoffs.slice()
    const sliced = rows.slice(offset, offset + limit).map((w) => ({
      ...w,
      item: w.item_id != null ? { id: w.item_id, name: db.instances.find((i) => i.id === w.item_id)?.name } : undefined,
      model: { id: w.model_id, name: db.models.find((m) => m.id === w.model_id)?.name },
      authorized_by: { id: w.authorized_by_id, username: db.users.find((u) => u.id === w.authorized_by_id)?.username },
    }))
    return json(ok(sliced, { limit, page: Math.floor(offset / Math.max(1, limit)) + 1, total: rows.length, calculated: true }))
  }),
  http.get('/api/writeoffs/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const w = id != null ? db.writeoffs.find((x) => x.id === id) : undefined
    if (!w) return json(fail('Данные не найдены'), { status: 404 })
    return json(ok(w))
  }),
  http.post('/api/writeoffs', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const body = (await request.json().catch(() => null)) as Partial<{
      item_id: number | null
      model_id: number
      authorized_by_id: number
      name: string
      reason: string
      act_number: string
      quantity: number
      comment: string
    }> | null
    try {
      const item = createWriteOff(auth.me, body ?? {})
      return json(ok(item))
    } catch (e) {
      if (e instanceof ServiceError) {
        return json(fail(e.message, { code: e.code, field: e.field }), { status: e.status })
      }
      throw e
    }
  }),

  // --- Reports ---
  http.get('/api/reports/equipment-status', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const byStatus: Record<string, number> = {}
    for (const i of db.instances) byStatus[i.status] = (byStatus[i.status] ?? 0) + 1
    return json(ok(Object.entries(byStatus).map(([status, count]) => ({ status, count }))))
  }),
  http.get('/api/reports/laborant-load', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const done = db.tickets.filter((t) => t.status === 'done' && t.laborant_id != null)
    const byLaborant: Record<number, number> = {}
    for (const t of done) byLaborant[t.laborant_id as number] = (byLaborant[t.laborant_id as number] ?? 0) + 1
    const rows = Object.entries(byLaborant).map(([laborantId, count]) => {
      const u = db.users.find((x) => x.id === Number(laborantId))
      return { laborant_id: Number(laborantId), laborant: u?.username ?? 'Лаборант', count }
    })
    return json(ok(rows))
  }),
]

