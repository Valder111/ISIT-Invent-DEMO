import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../ui/EntityLink'
import { ApiError } from '../api/http'
import { instancesApi, modelsApi, type EquipmentInstance, type EquipmentModel } from '../api/equipment'
import { EQUIPMENT_INSTANCE_STATUS_FILTERS, equipmentStatusRu } from '../lib/ruLabels'
import '../../css/panel.css'

type Props = {
  onClose: () => void
  /** displayName — краткое имя экземпляра для подписи в формах (опционально). */
  onPick: (instanceId: number, displayName?: string) => void
  disabled?: boolean
  /** На странице списания: не показывать уже списанные, фильтр по умолчанию «В норме». */
  forWriteoff?: boolean
}

export function EquipmentInstancePickerModal({ onClose, onPick, disabled, forWriteoff }: Props) {
  const [list, setList] = useState<EquipmentInstance[]>([])
  const [models, setModels] = useState<EquipmentModel[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [status, setStatus] = useState(forWriteoff ? 'ok' : '')
  const [modelId, setModelId] = useState<number | ''>('')

  useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(search.trim()), 320)
    return () => window.clearTimeout(t)
  }, [search])

  useEffect(() => {
    let c = false
    void (async () => {
      try {
        const ms = await modelsApi.list()
        if (!c) setModels(ms)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      c = true
    }
  }, [])

  const fetchInstances = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const rows = await instancesApi.list({
        search: searchDebounced || undefined,
        status: status || undefined,
        include_inactive: forWriteoff ? false : undefined,
      })
      setList(rows)
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [searchDebounced, status, forWriteoff])

  useEffect(() => {
    void fetchInstances()
  }, [fetchInstances])

  const statusFilters = useMemo(
    () =>
      forWriteoff
        ? EQUIPMENT_INSTANCE_STATUS_FILTERS.filter((o) => o.value !== 'written_off')
        : EQUIPMENT_INSTANCE_STATUS_FILTERS,
    [forWriteoff],
  )

  const filtered = useMemo(() => {
    let rows = list
    if (forWriteoff) {
      rows = rows.filter((r) => r.is_active !== false && r.status !== 'written_off')
    }
    if (modelId === '') return rows
    return rows.filter((r) => r.model_id === modelId)
  }, [list, modelId, forWriteoff])

  return (
    <div className="modal-backdrop modal-backdrop--picker" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-card modal-card--picker"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="modal-card__title">Выбор экземпляра оборудования</h3>
        <div className="doc-filters" style={{ marginBottom: 12 }}>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Поиск по названию модели</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Введите запрос…" />
          </label>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Статус</span>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusFilters.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Модель</span>
            <select
              className="select"
              value={modelId === '' ? '' : String(modelId)}
              onChange={(e) => setModelId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Все</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void fetchInstances()}>
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
                  <th>Экземпляр</th>
                  <th>Инв. №</th>
                  <th>Модель</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">
                      Нет подходящих записей — измените фильтры или поиск
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <button
                          type="button"
                          className="btn btn--sm"
                          disabled={disabled}
                          onClick={() => onPick(r.id, r.name || `экземпляр #${r.id}`)}
                        >
                          Выбрать
                        </button>
                      </td>
                      <td>{r.id}</td>
                      <td>
                        <EntityLink to={`/equipment/instance/${r.id}`} onClick={(e) => e.stopPropagation()}>
                          {r.name || '—'}
                        </EntityLink>
                      </td>
                      <td>{r.invent_number}</td>
                      <td>{r.model?.name ?? r.model_id}</td>
                      <td>{equipmentStatusRu(r.status)}</td>
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
