import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { activityApi, type ActivityLog } from '../../shared/api/activity'
import { ApiError } from '../../shared/api/http'
import { ACTIVITY_LOG_TYPE_OPTIONS, activityLogTypeRu } from '../../shared/lib/activityLogTypes'
import '../../css/panel.css'
import '../../css/logs-page.css'

const PAGE_SIZE = 15

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

export function LogsFullPage() {
  const [rows, setRows] = useState<ActivityLog[] | null>(null)
  const [total, setTotal] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data, meta } = await activityApi.listWithMeta({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        type: typeFilter || undefined,
      })
      setRows(data)
      setTotal(meta?.total ?? data.length)
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  useEffect(() => {
    void load()
  }, [load])

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  return (
    <div>
      <div className="tickets-toolbar">
        <h1 className="page-title">Журнал действий</h1>
        <Link className="btn btn--secondary btn--sm" to="/">
          На главную
        </Link>
      </div>

      <div className="log-toolbar">
        <label className="field logs-page__field--tight">
          <span className="field__label">Тип записи</span>
          <select
            className="select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(0)
            }}
          >
            {ACTIVITY_LOG_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="muted">
        Всего записей: {total}
        {total > 0 ? ` · показано ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)}` : ''}
      </p>

      {loading && <p className="muted">Загрузка…</p>}
      {err && <div className="alert alert--error">{err}</div>}
      {!loading && !err && rows && (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>Действие</th>
                  <th>Тип</th>
                  <th>Сущность</th>
                  <th>Пользователь</th>
                  <th>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted">
                      Пусто
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{fmt(r.created_at)}</td>
                      <td>{r.activity}</td>
                      <td>{activityLogTypeRu(r.type)}</td>
                      <td>
                        {r.entity_type} {r.entity_id != null ? `#${r.entity_id}` : ''}
                      </td>
                      <td>{r.user?.username ?? r.user_id ?? '—'}</td>
                      <td className="logs-page__comment-cell">{r.comment || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="actions-row logs-page__pager">
            <button type="button" className="btn btn--ghost btn--sm" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Назад
            </button>
            <span className="muted">
              Стр. {page + 1} / {maxPage + 1 || 1}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={page >= maxPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
            </button>
          </div>
        </>
      )}
    </div>
  )
}
