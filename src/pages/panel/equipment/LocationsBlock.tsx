import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/http'
import { locationsApi, type Location } from '../../../shared/api/equipment'
import { LocationModal } from './LocationModal'

export function LocationsBlock({ canEdit, onError }: { canEdit: boolean; onError: (s: string | null) => void }) {
  const [rows, setRows] = useState<Location[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<Location | 'new' | null>(null)
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
      setRows(await locationsApi.list())
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
        <h2 className="panel__title">Локации</h2>
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
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Локация…" />
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
                  <th className="data-table__actions">Изменить</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
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
        <LocationModal initial={open === 'new' ? null : open} onClose={() => setOpen(null)} onSaved={() => void load()} />
      )}
    </section>
  )
}
