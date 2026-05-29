import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../../../shared/ui/EntityLink'
import { ApiError } from '../../../shared/api/http'
import {
  instancesApi,
  locationsApi,
  modelsApi,
  type EquipmentInstance,
  type EquipmentModel,
  type Location,
} from '../../../shared/api/equipment'
import type { PanelKind } from '../../../shared/auth/RequirePanel'
import { EQUIPMENT_INSTANCE_STATUS_FILTERS, equipmentStatusRu } from '../../../shared/lib/ruLabels'
import { EntityDocumentsManageModal } from '../../../shared/components/EntityDocumentsManageModal'
import { InstanceModal } from './InstanceModal'

export function InstancesBlock({
  canEdit,
  onError,
  panel,
}: {
  canEdit: boolean
  onError: (s: string | null) => void
  panel: PanelKind
}) {
  const [rows, setRows] = useState<EquipmentInstance[] | null>(null)
  const [models, setModels] = useState<EquipmentModel[]>([])
  const [locs, setLocs] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<EquipmentInstance | 'new' | null>(null)
  const [docsFor, setDocsFor] = useState<EquipmentInstance | null>(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modelFilter, setModelFilter] = useState<number | ''>('')

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 320)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    onError(null)
    try {
      const [eq, ms, ls] = await Promise.all([
        instancesApi.list({
          search: searchDebounced || undefined,
          status: statusFilter || undefined,
          ...(panel === 'admin' ? { include_inactive: true } : {}),
        }),
        modelsApi.list(),
        locationsApi.list(),
      ])
      setRows(eq)
      setModels(ms)
      setLocs(ls)
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [onError, searchDebounced, statusFilter, panel])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRows = useMemo(() => {
    if (!rows) return []
    if (modelFilter === '') return rows
    return rows.filter((r) => r.model_id === modelFilter)
  }, [rows, modelFilter])

  const modelsForInstances = useMemo(() => models.filter((m) => !m.is_consumable), [models])

  const intro =
    panel === 'laborant' ? (
      <p className="muted panel-equip__intro">
        Просмотр экземпляров. Для перехода в каталог используйте ссылки. Редактирование доступно в панелях администратора и материально ответственного.
      </p>
    ) : null

  return (
    <section className="panel">
      <div className="panel__header panel-equip__header-row">
        <h2 className="panel__title">Экземпляры</h2>
        {canEdit && (
          <button type="button" className="btn btn--sm" onClick={() => setOpen('new')}>
            + Добавить
          </button>
        )}
      </div>
      <div className="panel__body">
        {intro}
        <div className="doc-filters panel-equip__filters">
          <label className="field panel-equip__field--tight">
            <span className="field__label">Поиск (модель / каталог)</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Модель или каталог…" />
          </label>
          <label className="field panel-equip__field--tight">
            <span className="field__label">Статус</span>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {EQUIPMENT_INSTANCE_STATUS_FILTERS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field panel-equip__field--tight">
            <span className="field__label">Модель</span>
            <select
              className="select"
              value={modelFilter === '' ? '' : String(modelFilter)}
              onChange={(e) => setModelFilter(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Все</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void load()}>
            Обновить
          </button>
        </div>
        {loading && <p className="muted">Загрузка…</p>}
        {!loading && rows && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя / инв. №</th>
                  <th>Модель</th>
                  <th>Статус</th>
                  {panel === 'admin' && <th>Активен</th>}
                  <th className="data-table__actions">Изменить</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <EntityLink to={`/equipment/instance/${r.id}`}>
                        {r.name || '—'} / {r.invent_number}
                      </EntityLink>
                    </td>
                    <td>{r.model?.name ?? r.model_id}</td>
                    <td>{equipmentStatusRu(r.status)}</td>
                    {panel === 'admin' && <td>{r.is_active ? 'да' : 'нет'}</td>}
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

      {open && canEdit && (
        <InstanceModal
          models={modelsForInstances}
          locations={locs}
          initial={open === 'new' ? null : open}
          onClose={() => setOpen(null)}
          onSaved={() => void load()}
        />
      )}
      {docsFor && canEdit && (
        <EntityDocumentsManageModal
          kind="instance"
          entityId={docsFor.id}
          entityLabel={docsFor.name || `#${docsFor.id}`}
          onClose={() => setDocsFor(null)}
        />
      )}
    </section>
  )
}
