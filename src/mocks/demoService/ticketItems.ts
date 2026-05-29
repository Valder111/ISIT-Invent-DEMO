import type { MeResponse } from '../../shared/api/auth'
import type { TicketItem } from '../../shared/api/tickets'
import { getDb, setDb } from '../mockDb'
import { badRequest, conflict, forbidden, notFound } from './errors'
import { enrichTicketItem } from './helpers'
import { appendActivity, nextId, nowIso } from './utils'

export function addTicketItem(
  me: MeResponse,
  ticketId: number,
  body: Partial<{ model_id: number; instance_id: number | null; quantity: number; comment: string }>,
) {
  const db = getDb()
  const ticket = db.tickets.find((t) => t.id === ticketId)
  if (!ticket) throw notFound('Заявка не найдена', 'ticket_id')
  if (ticket.author_id !== me.id) throw forbidden('Только создатель может добавлять в свою заявку')
  if (ticket.status !== 'draft') throw conflict('Можно добавлять только в черновик', 'INVALID_STATUS')

  const instanceId = typeof body.instance_id === 'number' ? body.instance_id : null
  const modelId = typeof body.model_id === 'number' ? body.model_id : null
  if (instanceId == null && modelId == null) {
    throw badRequest('Некорректные данные. Проверьте введённые поля', 'instance_id')
  }

  let quantity = typeof body.quantity === 'number' ? body.quantity : 1
  if (quantity < 0) throw badRequest('Некорректные данные. Проверьте введённые поля', 'quantity')
  if (quantity === 0) quantity = 1

  let resolvedModelId: number
  let resolvedInstanceId: number | null = null

  if (instanceId != null) {
    if (quantity !== 1) {
      throw badRequest('Некорректные данные. Проверьте введённые поля', 'quantity')
    }
    const inst = db.instances.find((i) => i.id === instanceId && i.is_active !== false)
    if (!inst) throw notFound('Оборудование не найдено или не активно', 'instance_id')
    if (db.ticketItems.some((it) => it.ticket_id === ticketId && it.instance_id === instanceId)) {
      throw conflict('Этот объект уже добавлен в заявку', 'ALREADY_EXISTS', 'instance_id')
    }
    resolvedModelId = inst.model_id
    resolvedInstanceId = instanceId
  } else {
    const model = db.models.find((m) => m.id === modelId && m.is_active !== false)
    if (!model) throw notFound('Модель не найдена или не активна', 'model_id')
    if (!model.is_consumable) {
      throw conflict('Эта модель не является расходником; нужно выдавать конкретный экземпляр', 'NOT_CONSUMABLE', 'model_id')
    }
    if (db.ticketItems.some((it) => it.ticket_id === ticketId && it.model_id === modelId && it.instance_id == null)) {
      throw conflict('Этот расходник уже добавлен в заявку', 'ALREADY_EXISTS', 'model_id')
    }
    resolvedModelId = modelId!
  }

  const item: TicketItem = {
    id: nextId(db.ticketItems),
    ticket_id: ticketId,
    model_id: resolvedModelId,
    instance_id: resolvedInstanceId,
    quantity,
    comment: body.comment ?? '',
    created_at: nowIso(),
    updated_at: nowIso(),
  }
  setDb({ ...db, ticketItems: [item, ...db.ticketItems] })
  appendActivity({
    type: 'ticket_item',
    entity_type: 'ticket_item',
    entity_id: item.id,
    user_id: me.id,
    activity: 'create',
    comment: `Добавлена позиция в заявку #${ticketId}`,
    created_at: nowIso(),
  })
  return enrichTicketItem(getDb(), item)
}
