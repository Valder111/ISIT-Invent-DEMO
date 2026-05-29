import type { MeResponse } from '../../shared/api/auth'
import type { EquipmentInstance, EquipmentModel } from '../../shared/api/equipment'
import type { PlatformDocument } from '../../shared/api/documents'
import type { Ticket, TicketItem } from '../../shared/api/tickets'
import type { DemoDb } from '../mockDb'
import { getDb } from '../mockDb'
import {
  hydrateDocument,
  hydrateDocuments,
  hydrateImg,
  hydrateInstance,
  presignIfKey,
} from '../hydrate'

export function enrichModel(db: DemoDb, m: EquipmentModel) {
  const type = db.types.find((t) => t.id === m.type_id)
  return hydrateImg({ ...m, type })
}

export function enrichInstance(db: DemoDb, i: EquipmentInstance) {
  const model = db.models.find((m) => m.id === i.model_id)
  const type = model ? db.types.find((t) => t.id === model.type_id) : undefined
  const location = i.location_id != null ? db.locations.find((l) => l.id === i.location_id) ?? null : null
  return hydrateInstance({
    ...i,
    model: model ? hydrateImg({ ...model, type }) : undefined,
    location,
  })
}

export function enrichTicketItem(db: DemoDb, it: TicketItem) {
  const model = db.models.find((m) => m.id === it.model_id)
  const type = model ? db.types.find((t) => t.id === model.type_id) : undefined
  const instance = it.instance_id != null ? db.instances.find((i) => i.id === it.instance_id) : undefined
  return {
    ...it,
    model: model ? hydrateImg({ ...model, type }) : undefined,
    instance: instance ? enrichInstance(db, instance) : null,
  }
}

export function enrichTicket(db: DemoDb, t: Ticket, withItems = false) {
  const authorU = db.users.find((x) => x.id === t.author_id)
  const laborantU = t.laborant_id != null ? db.users.find((x) => x.id === t.laborant_id) : undefined
  const base = {
    ...t,
    author: authorU ? { id: authorU.id, username: authorU.username, email: authorU.email } : undefined,
    laborant: laborantU ? { id: laborantU.id, username: laborantU.username } : null,
  }
  if (!withItems) return base
  const items = db.ticketItems.filter((it) => it.ticket_id === t.id).map((it) => enrichTicketItem(db, it))
  return { ...base, items }
}

export function enrichDocument(db: DemoDb, d: PlatformDocument) {
  const u = d.uploaded_by_id != null ? db.users.find((x) => x.id === d.uploaded_by_id) : undefined
  return hydrateDocument({
    ...d,
    uploaded_by: u ? { id: u.id, username: u.username, email: u.email } : null,
  })
}

export function enrichDocuments(db: DemoDb, docs: PlatformDocument[]) {
  return hydrateDocuments(docs.map((d) => enrichDocument(db, d)))
}

export function ticketVisibleTo(me: MeResponse, t: Ticket): boolean {
  if (me.role === 'admin' || me.role === 'inventory_manager') return true
  if (t.author_id === me.id) return true
  if (me.role === 'laborant') {
    if (t.laborant_id != null && t.laborant_id === me.id) return true
    if (t.status === 'in_progress' && t.laborant_id == null) return true
  }
  return false
}

export function filterTicketsForList(
  me: MeResponse,
  rows: Ticket[],
  opts?: { status?: string; author_id?: number; laborant_id?: number; type?: string; panel?: boolean },
) {
  const db = getDb()
  let list = rows.filter((t) => ticketVisibleTo(me, t))

  if (me.role === 'user') {
    list = list.filter((t) => t.author_id === me.id)
  } else if (me.role === 'laborant' && !opts?.author_id && !opts?.laborant_id && !opts?.panel) {
    list = list.filter(
      (t) =>
        t.author_id === me.id ||
        (t.status === 'in_progress' && (t.laborant_id == null || t.laborant_id === me.id)),
    )
  } else if (!opts?.panel && (me.role === 'admin' || me.role === 'inventory_manager')) {
    list = list.filter((t) => t.author_id === me.id)
  }

  if (opts?.status) list = list.filter((t) => t.status === opts.status)
  if (opts?.author_id != null) list = list.filter((t) => t.author_id === opts.author_id)
  if (opts?.laborant_id != null) list = list.filter((t) => (t.laborant_id ?? null) === opts.laborant_id)
  if (opts?.type) list = list.filter((t) => t.type === opts.type)

  return list.map((t) => enrichTicket(db, t))
}

export function userPublic(u: { id: number; username: string; email: string; role: string; img?: string; img_url?: string; is_active?: boolean }) {
  const { img_url, ...rest } = u
  const hydrated = hydrateImg({ ...rest, img: u.img ?? '', img_url })
  return hydrated
}

export function resolveImgUrl(img?: string) {
  return presignIfKey(img) ?? (img?.startsWith('/static/') ? img : undefined)
}
