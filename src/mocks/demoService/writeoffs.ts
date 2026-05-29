import type { MeResponse } from '../../shared/api/auth'
import type { WriteOff } from '../../shared/api/writeoffs'
import { getDb, setDb } from '../mockDb'
import { badRequest, conflict, forbidden, notFound } from './errors'
import { appendActivity, nextId, nowIso } from './utils'

export function createWriteOff(
  me: MeResponse,
  body: Partial<{
    item_id: number | null
    model_id: number
    authorized_by_id: number
    name: string
    reason: string
    act_number: string
    quantity: number
    comment: string
  }>,
) {
  if (me.role !== 'admin' && me.role !== 'inventory_manager') {
    throw forbidden('Только материально ответственный или администратор может списывать')
  }

  const db = getDb()
  const actNumber = typeof body.act_number === 'string' ? body.act_number.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!actNumber) throw badRequest('Некорректные данные. Проверьте введённые поля', 'act_number')
  if (!name) throw badRequest('Некорректные данные. Проверьте введённые поля', 'name')
  if (db.writeoffs.some((w) => w.act_number === actNumber)) {
    throw conflict('Номер акта уже используется', 'ACT_NUMBER_EXISTS', 'act_number')
  }

  const itemId = typeof body.item_id === 'number' ? body.item_id : null
  const modelId = typeof body.model_id === 'number' ? body.model_id : null
  if (itemId == null && modelId == null) {
    throw badRequest('Некорректные данные. Проверьте введённые поля', 'item_id')
  }

  let quantity = typeof body.quantity === 'number' ? body.quantity : 1
  if (quantity <= 0) quantity = 1

  const resolvedModelId =
    modelId ?? (itemId != null ? db.instances.find((i) => i.id === itemId)?.model_id ?? null : null)
  if (resolvedModelId == null) {
    throw badRequest('Некорректные данные. Проверьте введённые поля', itemId != null ? 'item_id' : 'model_id')
  }

  const model = db.models.find((m) => m.id === resolvedModelId)
  if (!model) throw notFound('Модель не найдена', 'model_id')

  let instancesNext = db.instances
  let modelsNext = db.models

  if (itemId != null) {
    const instIdx = db.instances.findIndex((i) => i.id === itemId)
    if (instIdx < 0) throw notFound('Данные не найдены', 'item_id')
    const inst = db.instances[instIdx]
    if (inst.status === 'written_off' || inst.is_active === false) {
      throw conflict('Действие невозможно из‑за конфликта данных', 'ALREADY_WRITTEN_OFF', 'item_id')
    }
    instancesNext = db.instances.slice()
    instancesNext[instIdx] = { ...inst, status: 'written_off', is_active: false, updated_at: nowIso() }
  } else if (model.is_consumable) {
    const mIdx = db.models.findIndex((m) => m.id === resolvedModelId)
    if (mIdx < 0) throw notFound('Модель не найдена', 'model_id')
    const cur = db.models[mIdx]
    if (cur.count < quantity) {
      throw conflict('Недостаточно расходника на складе', 'INSUFFICIENT_STOCK', 'quantity')
    }
    modelsNext = db.models.slice()
    modelsNext[mIdx] = { ...cur, count: cur.count - quantity, updated_at: nowIso() }
  }

  const item: WriteOff = {
    id: nextId(db.writeoffs),
    item_id: itemId,
    model_id: resolvedModelId,
    authorized_by_id: typeof body.authorized_by_id === 'number' ? body.authorized_by_id : me.id,
    name,
    reason: body.reason ?? '',
    act_number: actNumber,
    quantity,
    comment: body.comment ?? '',
    created_at: nowIso(),
  }

  setDb({
    ...db,
    instances: instancesNext,
    models: modelsNext,
    writeoffs: [item, ...db.writeoffs],
  })

  appendActivity({
    type: 'writeoffs',
    entity_type: 'writeoff',
    entity_id: item.id,
    user_id: me.id,
    activity: 'create',
    comment: `Списание: ${name} (акт ${actNumber})`,
    created_at: nowIso(),
  })

  return item
}
