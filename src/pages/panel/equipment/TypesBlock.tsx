import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../../../shared/ui/EntityLink'
import { ApiError } from '../../../shared/api/http'
import { typesApi, type EquipmentCategory } from '../../../shared/api/equipment'
import { ynRu } from '../../../shared/lib/ruLabels'
import { TypeModal } from './TypeModal'

export function TypesBlock({
  canEdit,
  onError,
}: {
  canEdit: boolean
  onError: (s: string | null) => void
}) {
  const [rows, setRows] = useState<EquipmentCategory[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<EquipmentCategory | 'new' | null>(null)
  const [search, setSearch] = useState('')

  const filteredRows = useMemo(() => {
    if (!rows) return []
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.name.toLowerCase().includes(q))
  }, [rows, search])

  const load = useCallback(async () => {
    setLoading(true)
    onError(null)
    try {
      setRows(await typesApi.list())
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
        <h2 className="panel__title">Категории оборудования</h2>
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
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Категория…" />
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
                  <th>Активна</th>
                  <th className="data-table__actions">Изменить</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <EntityLink to={`/equipment/category/${r.id}`}>{r.name}</EntityLink>
                    </td>
                    <td>{ynRu(r.is_active)}</td>
                    <td className="data-table__actions">
                      {canEdit && (
                        <div className="table-action-buttons">
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(r)}>
                            Изменить
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

      {open && canEdit && (
        <TypeModal initial={open === 'new' ? null : open} onClose={() => setOpen(null)} onSaved={() => void load()} />
      )}
    </section>
  )
}
