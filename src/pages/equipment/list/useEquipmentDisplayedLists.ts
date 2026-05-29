import { useMemo } from 'react'
import type { EquipmentCategory, EquipmentInstance, EquipmentModel } from '../../../shared/api/equipment'
import type { SearchState } from '../../../shared/search/useSemanticSearch'
import { sortByDate, sortByName, type Level, type SortKey } from './equipmentListUtils'

export function useEquipmentDisplayedLists({
  categories,
  models,
  instances,
  level,
  trimmedQuery,
  sort,
  queryState,
  semanticActive,
}: {
  categories: EquipmentCategory[] | null
  models: EquipmentModel[] | null
  instances: EquipmentInstance[] | null
  level: Level
  trimmedQuery: string
  sort: SortKey
  queryState: SearchState
  semanticActive: boolean
}) {
  const displayedCategories = useMemo(() => {
    if (!categories) return []
    if (semanticActive && level === 'category') {
      if (queryState.kind !== 'done') return []
      const scoreMap = new Map(queryState.hits.map((h) => [h.id, h.score]))
      const ordered = queryState.hits
        .map((h) => categories.find((c) => c.id === h.id))
        .filter((x): x is EquipmentCategory => !!x)
      return ordered.map((c) => ({ item: c, score: scoreMap.get(c.id) ?? 0 }))
    }
    let list = categories
    const q = trimmedQuery.toLowerCase()
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))
    if (sort === 'name_asc') list = sortByName(list, 'asc')
    else if (sort === 'name_desc') list = sortByName(list, 'desc')
    else if (sort === 'date_asc') list = sortByDate(list, 'asc')
    else list = sortByDate(list, 'desc')
    return list.map((c) => ({ item: c, score: 0 }))
  }, [categories, trimmedQuery, sort, semanticActive, level, queryState])

  const displayedModels = useMemo(() => {
    if (!models) return []
    if (semanticActive && level === 'model') {
      if (queryState.kind !== 'done') return []
      const scoreMap = new Map(queryState.hits.map((h) => [h.id, h.score]))
      const ordered = queryState.hits
        .map((h) => models.find((m) => m.id === h.id))
        .filter((x): x is EquipmentModel => !!x)
      return ordered.map((m) => ({ item: m, score: scoreMap.get(m.id) ?? 0 }))
    }
    let list = models
    const q = trimmedQuery.toLowerCase()
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q))
    if (sort === 'name_asc') list = sortByName(list, 'asc')
    else if (sort === 'name_desc') list = sortByName(list, 'desc')
    else if (sort === 'date_asc') list = sortByDate(list, 'asc')
    else list = sortByDate(list, 'desc')
    return list.map((m) => ({ item: m, score: 0 }))
  }, [models, trimmedQuery, sort, semanticActive, level, queryState])

  const displayedInstances = useMemo(() => {
    if (!instances) return []
    if (semanticActive && level === 'instance') {
      if (queryState.kind !== 'done') return []
      const scoreMap = new Map(queryState.hits.map((h) => [h.id, h.score]))
      const ordered = queryState.hits
        .map((h) => instances.find((i) => i.id === h.id))
        .filter((x): x is EquipmentInstance => !!x)
      return ordered.map((i) => ({ item: i, score: scoreMap.get(i.id) ?? 0 }))
    }
    let list = instances
    const q = trimmedQuery.toLowerCase()
    if (q) {
      list = list.filter((i) => {
        const n = (i.name || '').toLowerCase()
        const mn = (i.model?.name || '').toLowerCase()
        return n.includes(q) || mn.includes(q)
      })
    }
    const nameKey = (i: EquipmentInstance) => (i.name || i.model?.name || `#${i.id}`).toLowerCase()
    if (sort === 'name_asc') list = [...list].sort((a, b) => nameKey(a).localeCompare(nameKey(b), 'ru'))
    else if (sort === 'name_desc') list = [...list].sort((a, b) => nameKey(b).localeCompare(nameKey(a), 'ru'))
    else if (sort === 'date_asc') list = sortByDate(list, 'asc')
    else list = sortByDate(list, 'desc')
    return list.map((i) => ({ item: i, score: 0 }))
  }, [instances, trimmedQuery, sort, semanticActive, level, queryState])

  return { displayedCategories, displayedModels, displayedInstances }
}
