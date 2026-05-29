import { http } from 'msw'
import { fail, ok } from '../httpEnvelope'
import { enrichDocument, enrichDocuments, enrichInstance, userPublic } from '../demoService/helpers'
import { nextId, nowIso, parseNumber, randomQrToken } from '../demoService/utils'
import { getDb, setDb } from '../mockDb'
import { requireAuth } from './common'
import { json } from './respond'

export const extraHandlers = [
  http.post('/api/users', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    if (auth.me.role !== 'admin') return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      username: string
      email: string
      password: string
      role: string
      is_active: boolean
    }> | null
    if (!body?.username?.trim() || !body?.email?.trim() || !body?.password) {
      return json(fail('Некорректные данные. Проверьте введённые поля'), { status: 400 })
    }
    const id = nextId(db.users)
    const user = {
      id,
      username: body.username.trim(),
      email: body.email.trim(),
      password: body.password,
      role: (body.role ?? 'user') as import('../../shared/api/auth').UserRole,
      img: '',
      comment: '',
      is_active: body.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    setDb({ ...db, users: [user, ...db.users] })
    const { password: _pw, ...pub } = user
    return json(ok(userPublic(pub)))
  }),

  http.get('/api/users/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const u = id != null ? db.users.find((x) => x.id === id) : undefined
    if (!u) return json(fail('Данные не найдены'), { status: 404 })
    const { password: _pw, ...pub } = u
    return json(ok(userPublic(pub)))
  }),

  http.patch('/api/users/:id', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    if (auth.me.role !== 'admin') return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.users.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.users[idx]
    const updated = {
      ...cur,
      username: typeof body?.username === 'string' ? body.username : cur.username,
      email: typeof body?.email === 'string' ? body.email : cur.email,
      role: typeof body?.role === 'string' ? (body.role as typeof cur.role) : cur.role,
      is_active: typeof body?.is_active === 'boolean' ? body.is_active : cur.is_active,
      updated_at: nowIso(),
    }
    const users = db.users.slice()
    users[idx] = updated
    setDb({ ...db, users })
    const { password: _pw, ...pub } = updated
    return json(ok(userPublic(pub)))
  }),

  // Locations mutations
  http.post('/api/locations', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      name: string
      description: string
      comment: string
      is_active: boolean
    }> | null
    if (!body?.name?.trim()) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'name' }), { status: 400 })
    const item = {
      id: nextId(db.locations),
      name: body.name.trim(),
      description: body.description ?? '',
      comment: body.comment ?? '',
      is_active: body.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    setDb({ ...db, locations: [item, ...db.locations] })
    return json(ok(item))
  }),

  http.put('/api/locations/:id', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.locations.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.locations[idx]
    const updated = {
      ...cur,
      name: typeof body?.name === 'string' ? body.name : cur.name,
      description: typeof body?.description === 'string' ? body.description : cur.description,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      is_active: typeof body?.is_active === 'boolean' ? body.is_active : cur.is_active,
      updated_at: nowIso(),
    }
    const next = db.locations.slice()
    next[idx] = updated
    setDb({ ...db, locations: next })
    return json(ok(updated))
  }),

  http.delete('/api/locations/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    if (id == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({ ...db, locations: db.locations.filter((x) => x.id !== id) })
    return json(ok({ message: 'deleted', id }))
  }),

  // Equipment CRUD
  http.post('/api/equipment', async ({ request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      model_id: number
      location_id: number | null
      name: string
      description: string
      invent_number: number
      factory_number: string
      status: string
      img: string
      comment: string
      is_active: boolean
    }> | null
    if (!body?.name?.trim()) return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'name' }), { status: 400 })
    if (typeof body?.model_id !== 'number') return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'model_id' }), { status: 400 })
    const id = nextId(db.instances)
    const item = {
      id,
      model_id: body.model_id,
      location_id: typeof body.location_id === 'number' ? body.location_id : null,
      name: body.name.trim(),
      description: body.description ?? '',
      invent_number: typeof body.invent_number === 'number' ? body.invent_number : id,
      factory_number: body.factory_number ?? '',
      status: body.status ?? 'ok',
      qr_token: randomQrToken(),
      qr_img: `qr/${id}`,
      img: body.img ?? `equipment/${id}`,
      comment: body.comment ?? '',
      is_active: body.is_active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    }
    setDb({ ...db, instances: [item, ...db.instances] })
    return json(ok(enrichInstance(getDb(), item)))
  }),

  http.put('/api/equipment/:id', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    const idx = id != null ? db.instances.findIndex((x) => x.id === id) : -1
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.instances[idx]
    const updated = {
      ...cur,
      model_id: typeof body?.model_id === 'number' ? body.model_id : cur.model_id,
      location_id:
        typeof body?.location_id === 'number' ? body.location_id : body?.location_id === null ? null : cur.location_id,
      name: typeof body?.name === 'string' ? body.name : cur.name,
      description: typeof body?.description === 'string' ? body.description : cur.description,
      invent_number: typeof body?.invent_number === 'number' ? body.invent_number : cur.invent_number,
      factory_number: typeof body?.factory_number === 'string' ? body.factory_number : cur.factory_number,
      status: typeof body?.status === 'string' ? body.status : cur.status,
      img: typeof body?.img === 'string' ? body.img : cur.img,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      is_active: typeof body?.is_active === 'boolean' ? body.is_active : cur.is_active,
      updated_at: nowIso(),
    }
    const next = db.instances.slice()
    next[idx] = updated
    setDb({ ...db, instances: next })
    return json(ok(enrichInstance(getDb(), updated)))
  }),

  http.delete('/api/equipment/:id', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const id = parseNumber(String(params.id))
    const db = getDb()
    if (id == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({ ...db, instances: db.instances.filter((x) => x.id !== id) })
    return json(ok({ message: 'deleted', id }))
  }),

  // Model documents
  http.get('/api/models/:id/docs', ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const modelId = parseNumber(String(params.id))
    if (modelId == null) return json(fail('Некорректные данные'), { status: 400 })
    const url = new URL(request.url)
    const publicOnly = url.searchParams.get('public') === '1' || url.searchParams.get('public') === 'true'
    const db = getDb()
    const rows = db.documents.filter((d) => d.model_id === modelId).filter((d) => (publicOnly ? d.is_public : true))
    return json(ok(enrichDocuments(db, rows)))
  }),

  http.post('/api/models/:id/docs', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const modelId = parseNumber(String(params.id))
    if (modelId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const body = (await request.json().catch(() => null)) as Partial<{
      object_key: string
      filename: string
      content_type: string
      size: number
      is_public: boolean
      comment: string
    }> | null
    if (!body?.object_key || !body?.filename) {
      return json(fail('Некорректные данные. Проверьте введённые поля', { field: 'object_key' }), { status: 400 })
    }
    const doc = {
      id: nextId(db.documents),
      ticket_id: null,
      model_id: modelId,
      instance_id: null,
      object_key: body.object_key,
      filename: body.filename,
      content_type: body.content_type ?? 'application/octet-stream',
      size: body.size ?? 0,
      is_public: body.is_public ?? true,
      uploaded_by_id: auth.me.id,
      comment: body.comment ?? '',
      created_at: nowIso(),
    }
    setDb({ ...db, documents: [doc, ...db.documents] })
    return json(ok(enrichDocument(getDb(), doc)))
  }),

  http.delete('/api/models/:id/docs/:docId', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const modelId = parseNumber(String(params.id))
    const docId = parseNumber(String(params.docId))
    if (modelId == null || docId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    setDb({ ...db, documents: db.documents.filter((d) => !(d.model_id === modelId && d.id === docId)) })
    return json(ok({}))
  }),

  http.patch('/api/models/:id/docs/:docId', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const modelId = parseNumber(String(params.id))
    const docId = parseNumber(String(params.docId))
    if (modelId == null || docId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const idx = db.documents.findIndex((d) => d.model_id === modelId && d.id === docId)
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.documents[idx]
    const updated = { ...cur, is_public: typeof body?.is_public === 'boolean' ? body.is_public : cur.is_public }
    const next = db.documents.slice()
    next[idx] = updated
    setDb({ ...db, documents: next })
    return json(ok(enrichDocument(getDb(), updated)))
  }),

  http.get('/api/docs/linkable', () => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const db = getDb()
    const rows = db.documents.filter((d) => d.ticket_id == null && d.instance_id == null && d.model_id == null)
    return json(ok(enrichDocuments(db, rows)))
  }),

  http.delete('/api/tickets/:id/hard', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    if (auth.me.role !== 'admin') return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    const id = parseNumber(String(params.id))
    const db = getDb()
    if (id == null) return json(fail('Некорректные данные'), { status: 400 })
    setDb({
      ...db,
      tickets: db.tickets.filter((x) => x.id !== id),
      ticketItems: db.ticketItems.filter((x) => x.ticket_id !== id),
      documents: db.documents.filter((x) => x.ticket_id !== id),
    })
    return json(ok({ message: 'hard_deleted', ticket_id: id }))
  }),

  // Ticket items by equipment_id (instance id)
  http.delete('/api/tickets/:id/items/:equipmentId', ({ params }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const equipmentId = parseNumber(String(params.equipmentId))
    if (ticketId == null || equipmentId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const ticket = db.tickets.find((t) => t.id === ticketId)
    if (!ticket) return json(fail('Данные не найдены'), { status: 404 })
    if (ticket.author_id !== auth.me.id) return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    if (ticket.status !== 'draft') {
      return json(fail('Действие невозможно из‑за конфликта данных', { code: 'INVALID_STATUS' }), { status: 409 })
    }
    setDb({
      ...db,
      ticketItems: db.ticketItems.filter((x) => !(x.ticket_id === ticketId && x.instance_id === equipmentId)),
    })
    return json(ok({}))
  }),

  http.put('/api/tickets/:id/items/:equipmentId', async ({ params, request }) => {
    const auth = requireAuth()
    if (!auth.ok) return auth.response
    const ticketId = parseNumber(String(params.id))
    const equipmentId = parseNumber(String(params.equipmentId))
    if (ticketId == null || equipmentId == null) return json(fail('Некорректные данные'), { status: 400 })
    const db = getDb()
    const ticket = db.tickets.find((t) => t.id === ticketId)
    if (!ticket) return json(fail('Данные не найдены'), { status: 404 })
    if (ticket.author_id !== auth.me.id) return json(fail('У вас нет доступа к этому действию'), { status: 403 })
    if (ticket.status !== 'draft') {
      return json(fail('Действие невозможно из‑за конфликта данных', { code: 'INVALID_STATUS' }), { status: 409 })
    }
    const idx = db.ticketItems.findIndex((x) => x.ticket_id === ticketId && x.instance_id === equipmentId)
    if (idx < 0) return json(fail('Данные не найдены'), { status: 404 })
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const cur = db.ticketItems[idx]
    const updated = {
      ...cur,
      quantity: typeof body?.quantity === 'number' ? body.quantity : cur.quantity,
      comment: typeof body?.comment === 'string' ? body.comment : cur.comment,
      updated_at: nowIso(),
    }
    const next = db.ticketItems.slice()
    next[idx] = updated
    setDb({ ...db, ticketItems: next })
    return json(ok(updated))
  }),
]
