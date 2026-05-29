import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../../../shared/ui/EntityLink'
import { ApiError } from '../../../shared/api/http'
import { modelsApi, typesApi, type EquipmentCategory, type EquipmentModel } from '../../../shared/api/equipment'
import { ynRu } from '../../../shared/lib/ruLabels'
import { EntityDocumentsManageModal } from '../../../shared/components/EntityDocumentsManageModal'
import { ModelModal } from './ModelModal'

export function ModelsBlock({ canEdit, onError }: { canEdit: boolean; onError: (s: string | null) => void }) {
  const [rows, setRows] = useState<EquipmentModel[] | null>(null)
  const [types, setTypes] = useState<EquipmentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<EquipmentModel | 'new' | null>(null)
  const [docsFor, setDocsFor] = useState<EquipmentModel | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<number | ''>('')
  const [consumFilter, setConsumFilter] = useState<'all' | 'yes' | 'no'>('all')

  const filteredRows = useMemo(() => {
    if (!rows) return []
    return rows.filter((r) => {
      if (typeFilter !== '' && r.type_id !== typeFilter) return false
      if (consumFilter === 'yes' && !r.is_consumable) return false
      if (consumFilter === 'no' && r.is_consumable) return false
      const q = search.trim().toLowerCase()
      if (q && !r.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, search, typeFilter, consumFilter])

  const load = useCallback(async () => {
    setLoading(true)
    onError(null)
    try {
      const [ms, ts] = await Promise.all([modelsApi.list(), typesApi.list()])
      setRows(ms)
      setTypes(ts)
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [onError])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="panel">
      <div className="panel__header panel-equip__header-row">
        <h2 className="panel__title">Модели</h2>
        {canEdit && (
          <button type="button" className="btn btn--sm" onClick={() => setOpen('new')}>
            + Добавить
          </button>
        )}
      </div>
      <div className="panel__body">
        <div className="doc-filters panel-equip__filters">
          <label className="field panel-equip__field--tight">
            <span className="field__label">Поиск по названию</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Модель…" />
          </label>
          <label className="field panel-equip__field--tight">
            <span className="field__label">Категория</span>
            <select className="select" value={typeFilter === '' ? '' : String(typeFilter)} onChange={(e) => setTypeFilter(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">Все</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field panel-equip__field--tight">
            <span className="field__label">Расходник</span>
            <select className="select" value={consumFilter} onChange={(e) => setConsumFilter(e.target.value as typeof consumFilter)}>
              <option value="all">Все</option>
              <option value="yes">Да</option>
              <option value="no">Нет</option>
            </select>
          </label>
        </div>
        {loading && <p className="muted">Загрузка…</p>}
        {!loading && rows && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Расходник</th>
                  <th className="data-table__actions">Изменить</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <EntityLink to={`/equipment/model/${r.id}`}>{r.name}</EntityLink>
                    </td>
                    <td>{r.type?.name ?? r.type_id}</td>
                    <td>{ynRu(r.is_consumable)}</td>
                    <td className="data-table__actions">
                      {canEdit && (
                        <div className="table-action-buttons">
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(r)}>
                            Изменить
                          </button>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDocsFor(r)}>
                            Документы
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && canEdit && <ModelModal types={types} initial={open === 'new' ? null : open} onClose={() => setOpen(null)} onSaved={() => void load()} />}
      {docsFor && canEdit && (
        <EntityDocumentsManageModal kind="model" entityId={docsFor.id} entityLabel={docsFor.name} onClose={() => setDocsFor(null)} />
      )}
    </section>
  )
}
