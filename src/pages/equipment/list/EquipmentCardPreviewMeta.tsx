import type { EquipmentCategory, EquipmentInstance, EquipmentModel } from '../../../shared/api/equipment'
import { fmtDate } from './equipmentListUtils'

/** API может отдавать заводской номер; пересечение страхует от рассинхрона типов с бэкендом. */
type EquipmentInstanceCard = EquipmentInstance & { factory_number?: string }

function factoryNumberLabel(raw: string | undefined) {
  const t = raw?.trim()
  return t && t.length > 0 ? t : 'Не указан'
}

export function EquipmentCategoryPreviewMeta({ item: c }: { item: EquipmentCategory }) {
  return (
    <div className="equipment-card__meta">
      <div>Создано: {fmtDate(c.created_at)}</div>
      <div>Обновлено: {fmtDate(c.updated_at)}</div>
    </div>
  )
}

export function EquipmentModelPreviewMeta({ item: m }: { item: EquipmentModel }) {
  return (
    <div className="equipment-card__meta">
      <div>Создано: {fmtDate(m.created_at)}</div>
      <div>Обновлено: {fmtDate(m.updated_at)}</div>
    </div>
  )
}

export function EquipmentInstancePreviewMeta({ item: i }: { item: EquipmentInstanceCard }) {
  return (
    <div className="equipment-card__meta">
      <div>Создано: {fmtDate(i.created_at)}</div>
      <div>Обновлено: {fmtDate(i.updated_at)}</div>
      <div>Инв. №: {i.invent_number}</div>
      <div>Зав. №: {factoryNumberLabel(i.factory_number)}</div>
    </div>
  )
}
