import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../../css/equipment.css'
import '../../../css/global-search-page.css'
import { ApiError } from '../../../shared/api/http'
import { instancesApi, modelsApi, typesApi } from '../../../shared/api/equipment'
import { SemanticStatusBanner } from '../../../shared/search/SemanticStatusBanner'
import { buildSearchText } from '../../../shared/search/semanticSearch'
import type { EntityType, SearchDoc } from '../../../shared/search/types'
import { useEmbeddingStatus, useSemanticIndex, useSemanticQuery } from '../../../shared/search/useSemanticSearch'
import { GlobalSearchResultsGrid } from './GlobalSearchResultsGrid'
import { TYPE_FILTER_ORDER, TYPE_LABEL, type GlobalSearchBundle } from './globalSearchTypes'
import { useMobileLayout } from '../../../shared/lib/useMobileLayout'
import { useGlobalSearchCards } from './useGlobalSearchCards'

export function GlobalSearchPage() {
  const [data, setData] = useState<GlobalSearchBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all')

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const [categories, models, instances] = await Promise.all([typesApi.list(), modelsApi.list(), instancesApi.list()])
        if (!cancelled) setData({ categories, models, instances })
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiError ? e.message : 'Ошибка загрузки данных')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const semanticDocs = useMemo<SearchDoc[] | null>(() => {
    if (!data) return null
    const docs: SearchDoc[] = []
    for (const c of data.categories) {
      docs.push({ type: 'category', id: c.id, text: buildSearchText([c.name, c.description, c.comment]) })
    }
    for (const m of data.models) {
      docs.push({ type: 'model', id: m.id, text: buildSearchText([m.name, m.description, m.comment]) })
    }
    for (const i of data.instances) {
      docs.push({
        type: 'instance',
        id: i.id,
        text: buildSearchText([i.name, i.description, i.comment, i.model?.name]),
      })
    }
    return docs
  }, [data])

  const modelStatus = useEmbeddingStatus(true)
  const { state: indexState, index } = useSemanticIndex(semanticDocs, true)
  const queryState = useSemanticQuery(query, index, true, { topK: 80, minScore: 0.2 })

  const cards = useGlobalSearchCards(data, queryState, typeFilter)

  const trimmed = query.trim()
  const hasQuery = trimmed.length >= 2
  const mobile = useMobileLayout()
  const searchPlaceholder = mobile
    ? 'ИИ-поиск: высокая нагрузка...'
    : 'Опишите своими словами: «шнур для питания», «беспроводная мышь»…'

  return (
    <div className="equipment-page global-search-page">
      <h1 className="page-title">Глобальный поиск</h1>
      <p className="muted global-search-page__lead">
        Ищет по смыслу запроса сразу по категориям, моделям и экземплярам. Подходит для бытовых формулировок вроде «шнур для питания» или «беспроводная мышь».
      </p>

      <div className={`toolbar global-search-page__toolbar${mobile ? ' toolbar--ai-mobile' : ''}`}>
        <input
          className="toolbar__search"
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Глобальный поиск"
        />
        <div className="segmented" role="tablist" aria-label="Фильтр по типу">
          {TYPE_FILTER_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              className={`segmented__btn ${typeFilter === t ? 'segmented__btn--active' : ''}`}
              onClick={() => setTypeFilter(t)}
              aria-pressed={typeFilter === t}
            >
              {t === 'all' ? 'Все' : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <Link to="/equipment" className="btn btn--secondary btn--sm">
          К списку
        </Link>
      </div>

      <SemanticStatusBanner modelStatus={modelStatus} indexState={indexState} alwaysOn />

      {loading && <p className="muted">Загрузка данных…</p>}
      {error && <div className="alert alert--error">{error}</div>}

      {!loading && !error && !hasQuery && <p className="muted">Введите запрос (от 2 символов), чтобы увидеть результаты.</p>}
      {!loading && !error && hasQuery && queryState.kind === 'searching' && <p className="muted">Ищу по смыслу…</p>}
      {!loading && !error && hasQuery && queryState.kind === 'done' && cards.length === 0 && (
        <p className="muted">Ничего похожего не нашлось. Попробуйте перефразировать запрос.</p>
      )}

      <GlobalSearchResultsGrid cards={cards} />
    </div>
  )
}
