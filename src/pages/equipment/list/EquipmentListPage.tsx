import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import '../../../css/equipment.css'
import { ApiError } from '../../../shared/api/http'
import { instancesApi, modelsApi, typesApi, type EquipmentCategory, type EquipmentInstance, type EquipmentModel } from '../../../shared/api/equipment'
import { SemanticStatusBanner } from '../../../shared/search/SemanticStatusBanner'
import { buildSearchText } from '../../../shared/search/semanticSearch'
import type { SearchDoc } from '../../../shared/search/types'
import { useEmbeddingStatus, useSemanticIndex, useSemanticQuery } from '../../../shared/search/useSemanticSearch'
import type { EquipmentCardSize } from '../equipmentCardSize'
import { EquipmentBreadcrumbs } from '../EquipmentBreadcrumbs'
import { EquipmentToolbar } from '../EquipmentToolbar'
import { EquipmentCategoryGrid } from './EquipmentCategoryGrid'
import { EquipmentInstanceGrid } from './EquipmentInstanceGrid'
import { EquipmentModelGrid } from './EquipmentModelGrid'
import { type Level, type SortKey } from './equipmentListUtils'
import { useEquipmentDisplayedLists } from './useEquipmentDisplayedLists'

const EQUIPMENT_CARD_SIZE_KEY = 'equipmentListCardSize'

function readStoredEquipmentCardSize(): EquipmentCardSize {
  try {
    const v = localStorage.getItem(EQUIPMENT_CARD_SIZE_KEY)
    if (v === 'compact' || v === 'large') return v
  } catch {
    /* ignore */
  }
  return 'large'
}

export function EquipmentListPage() {
  const [params, setParams] = useSearchParams()

  const level = (params.get('level') as Level | null) || 'category'
  const parentRaw = params.get('parent')
  const parentId = parentRaw ? Number(parentRaw) : NaN

  const [sort, setSort] = useState<SortKey>('name_asc')
  const [search, setSearch] = useState('')
  const [smart, setSmart] = useState(false)
  const [cardSize, setCardSize] = useState<EquipmentCardSize>(() => readStoredEquipmentCardSize())

  const [categories, setCategories] = useState<EquipmentCategory[] | null>(null)
  const [models, setModels] = useState<EquipmentModel[] | null>(null)
  const [instances, setInstances] = useState<EquipmentInstance[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [ctxCategory, setCtxCategory] = useState<EquipmentCategory | null>(null)
  const [ctxModel, setCtxModel] = useState<EquipmentModel | null>(null)

  const setLevel = useCallback(
    (next: Level, parent?: number) => {
      const p = new URLSearchParams()
      p.set('level', next)
      if (parent !== undefined && !Number.isNaN(parent)) p.set('parent', String(parent))
      setParams(p, { replace: true })
    },
    [setParams],
  )

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        if (level === 'category') {
          const list = await typesApi.list()
          if (!cancelled) {
            setCategories(list)
            setModels(null)
            setInstances(null)
            setCtxCategory(null)
            setCtxModel(null)
          }
        } else if (level === 'model') {
          if (!Number.isFinite(parentId)) {
            if (!cancelled) {
              setError('Не указана категория')
              setModels([])
              setCtxCategory(null)
            }
          } else {
            const [list, cat] = await Promise.all([modelsApi.list({ type_id: parentId }), typesApi.get(parentId)])
            if (!cancelled) {
              setModels(list)
              setCtxCategory(cat)
              setInstances(null)
              setCtxModel(null)
            }
          }
        } else {
          if (Number.isFinite(parentId)) {
            try {
              const m = await modelsApi.get(parentId)
              if (cancelled) return
              if (m.is_consumable) {
                setLevel('model', m.type_id)
                return
              }
              const list = await instancesApi.list()
              if (cancelled) return
              setInstances(list.filter((x) => x.model_id === parentId))
              setCategories(null)
              setModels(null)
              setCtxModel(m)
              setCtxCategory(m.type ?? null)
            } catch {
              if (!cancelled) {
                setInstances([])
                setCategories(null)
                setModels(null)
                setCtxModel(null)
                setCtxCategory(null)
              }
            }
          } else {
            const list = await instancesApi.list()
            if (!cancelled) {
              setInstances(list)
              setCategories(null)
              setModels(null)
              setCtxModel(null)
              setCtxCategory(null)
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'Ошибка загрузки')
          setCategories([])
          setModels([])
          setInstances([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [level, parentId, setLevel])

  const semanticDocs = useMemo<SearchDoc[] | null>(() => {
    if (!smart) return null
    if (level === 'category' && categories) {
      return categories.map((c) => ({
        type: 'category',
        id: c.id,
        text: buildSearchText([c.name, c.description, c.comment]),
      }))
    }
    if (level === 'model' && models) {
      return models.map((m) => ({
        type: 'model',
        id: m.id,
        text: buildSearchText([m.name, m.description, m.comment, ctxCategory?.name]),
      }))
    }
    if (level === 'instance' && instances) {
      return instances.map((i) => ({
        type: 'instance',
        id: i.id,
        text: buildSearchText([i.name, i.description, i.comment, i.model?.name]),
      }))
    }
    return null
  }, [smart, level, categories, models, instances, ctxCategory])

  const modelStatus = useEmbeddingStatus(smart)
  const { state: indexState, index } = useSemanticIndex(semanticDocs, smart)
  const queryState = useSemanticQuery(search, index, smart, { topK: 50, minScore: 0.2 })

  const trimmedQuery = search.trim()
  const semanticActive = smart && trimmedQuery.length >= 2

  const { displayedCategories, displayedModels, displayedInstances } = useEquipmentDisplayedLists({
    categories,
    models,
    instances,
    level,
    trimmedQuery,
    sort,
    queryState,
    semanticActive,
  })

  return (
    <div className="equipment-page">
      <h1 className="page-title">Оборудование</h1>

      <EquipmentBreadcrumbs
        level={level}
        category={ctxCategory}
        model={ctxModel}
        onToCategories={() => setLevel('category')}
        onToModels={(categoryId) => setLevel('model', categoryId)}
      />

      <EquipmentToolbar
        search={search}
        sort={sort}
        smart={smart}
        cardSize={cardSize}
        canGoBack={level !== 'category'}
        onSearchChange={setSearch}
        onSortChange={setSort}
        onSmartChange={setSmart}
        onCardSizeChange={(next) => {
          setCardSize(next)
          try {
            localStorage.setItem(EQUIPMENT_CARD_SIZE_KEY, next)
          } catch {
            /* ignore */
          }
        }}
        onBack={() => {
          if (level === 'model') setLevel('category')
          else if (level === 'instance') {
            if (ctxModel?.type_id) setLevel('model', ctxModel.type_id)
            else setLevel('category')
          }
        }}
      />

      {smart && <SemanticStatusBanner modelStatus={modelStatus} indexState={indexState} />}

      {loading && <p className="muted">Загрузка…</p>}
      {error && <div className="alert alert--error">{error}</div>}
      {semanticActive && queryState.kind === 'searching' && <p className="muted">Ищу по смыслу…</p>}
      {semanticActive && queryState.kind === 'done' && queryState.hits.length === 0 && (
        <p className="muted">Ничего похожего не нашлось. Попробуйте перефразировать запрос.</p>
      )}

      {!loading && !error && level === 'category' && (
        <EquipmentCategoryGrid rows={displayedCategories} semanticActive={semanticActive} cardSize={cardSize} setLevel={setLevel} />
      )}

      {!loading && !error && level === 'model' && (
        <EquipmentModelGrid rows={displayedModels} semanticActive={semanticActive} cardSize={cardSize} setLevel={setLevel} />
      )}

      {!loading && !error && level === 'instance' && (
        <EquipmentInstanceGrid rows={displayedInstances} semanticActive={semanticActive} cardSize={cardSize} />
      )}
    </div>
  )
}
