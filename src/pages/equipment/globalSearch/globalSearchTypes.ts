import type { EquipmentCategory, EquipmentInstance, EquipmentModel } from '../../../shared/api/equipment'
import type { EntityType } from '../../../shared/search/types'

export type GlobalSearchBundle = {
  categories: EquipmentCategory[]
  models: EquipmentModel[]
  instances: EquipmentInstance[]
}

export type GlobalSearchCard = {
  type: EntityType
  id: number
  title: string
  meta: string
  imgUrl?: string
  href: string
  score: number
}

export function fmtScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export const TYPE_LABEL: Record<EntityType, string> = {
  category: 'Категория',
  model: 'Модель',
  instance: 'Экземпляр',
}

export const TYPE_FILTER_ORDER: Array<EntityType | 'all'> = ['all', 'category', 'model', 'instance']
