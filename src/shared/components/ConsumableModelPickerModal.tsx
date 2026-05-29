import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../ui/EntityLink'
import { ApiError } from '../api/http'
import { modelsApi, type EquipmentModel } from '../api/equipment'
import '../../css/panel.css'

type Props = {
  onClose: () => void
  onPick: (modelId: number, modelName: string) => void
  disabled?: boolean
}

/** Выбор модели-расходника (только is_consumable). */
export function ConsumableModelPickerModal({ onClose, onPick, disabled }: Props) {
  const [list, setList] = useState<EquipmentModel[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(search.trim()), 320)
    return () => window.clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const rows = await modelsApi.list({ consumable: true })
      setList(rows)
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (!searchDebounced) return list
    const q = searchDebounced.toLowerCase()
    return list.filter((m) => m.name.toLowerCase().includes(q) || String(m.id).includes(q))
  }, [list, searchDebounced])

  return (
    <div className="modal-backdrop modal-backdrop--picker" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-card modal-card--picker"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="modal-card__title">Выбор модели расходника</h3>
        <div className="doc-filters" style={{ marginBottom: 12 }}>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Поиск</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Название или ID…" />
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void load()}>
            Обновить
          </button>
        </div>
        {err && <div className="alert alert--error">{err}</div>}
        {loading && <p className="muted">Загрузка…</p>}
        {!loading && (
          <div className="table-scroll modal-picker__table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th />
                  <th>ID</th>
                  <th>Модель</th>
                  <th>Остаток</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      Нет расходников — проверьте каталог моделей с флажком «Расходный материал»
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <button type="button" className="btn btn--sm" disabled={disabled} onClick={() => onPick(m.id, m.name)}>
                          Выбрать
                        </button>
                      </td>
                      <td>{m.id}</td>
                      <td>
                        <EntityLink to={`/equipment/model/${m.id}`} onClick={(e) => e.stopPropagation()}>
                          {m.name}
                        </EntityLink>
                      </td>
                      <td>{m.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <span />
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
