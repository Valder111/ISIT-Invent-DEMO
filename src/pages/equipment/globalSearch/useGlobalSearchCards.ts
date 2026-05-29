import { useMemo } from 'react'
import type { SearchState } from '../../../shared/search/useSemanticSearch'
import type { GlobalSearchBundle, GlobalSearchCard } from './globalSearchTypes'
import type { EntityType } from '../../../shared/search/types'

export function useGlobalSearchCards(data: GlobalSearchBundle | null, queryState: SearchState, typeFilter: EntityType | 'all') {
  return useMemo<GlobalSearchCard[]>(() => {
    if (!data || queryState.kind !== 'done') return []
    const out: GlobalSearchCard[] = []
    for (const h of queryState.hits) {
      if (typeFilter !== 'all' && h.type !== typeFilter) continue
      if (h.type === 'category') {
        const c = data.categories.find((x) => x.id === h.id)
        if (!c) continue
        out.push({
          type: 'category',
          id: c.id,
          title: c.name,
          meta: 'Категория оборудования',
          imgUrl: c.img_url,
          href: `/equipment/category/${c.id}`,
          score: h.score,
        })
      } else if (h.type === 'model') {
        const m = data.models.find((x) => x.id === h.id)
        if (!m) continue
        out.push({
          type: 'model',
          id: m.id,
          title: m.name,
          meta: m.is_consumable ? 'Модель · расходник' : 'Модель',
          imgUrl: m.img_url,
          href: `/equipment/model/${m.id}`,
          score: h.score,
        })
      } else {
        const i = data.instances.find((x) => x.id === h.id)
        if (!i) continue
        out.push({
          type: 'instance',
          id: i.id,
          title: i.name || i.model?.name || `Экземпляр #${i.id}`,
          meta: `Инв. № ${i.invent_number} · ${i.status}`,
          imgUrl: i.img_url,
          href: `/equipment/instance/${i.id}`,
          score: h.score,
        })
      }
    }
    return out
  }, [data, queryState, typeFilter])
}
