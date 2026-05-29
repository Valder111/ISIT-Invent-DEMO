import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EntityLink } from '../../shared/ui/EntityLink'
import '../../css/tickets.css'
import { ApiError } from '../../shared/api/http'
import { useAuthState } from '../../shared/auth/useAuthState'
import { ticketsApi, type Ticket } from '../../shared/api/tickets'
import { filterTicketsForViewer } from '../../shared/lib/ticketVisibility'
import { ticketStatusRu, ticketTypeRu } from '../../shared/lib/ruLabels'

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

function statusClass(s: string) {
  if (s === 'draft') return 'status-badge status-badge--draft'
  if (s === 'in_progress') return 'status-badge status-badge--in_progress'
  if (s === 'done') return 'status-badge status-badge--done'
  if (s === 'cancelled') return 'status-badge status-badge--cancelled'
  return 'status-badge'
}

export function TicketsListPage() {
  const { me } = useAuthState()
  const navigate = useNavigate()
  const [list, setList] = useState<Ticket[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setErr(null)
      try {
        const rows = await ticketsApi.list()
        if (!cancelled) setList(rows)
      } catch (e) {
        if (!cancelled) setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const visible = useMemo(() => {
    const base = me ? filterTicketsForViewer(list ?? [], me) : []
    const q = search.trim().toLowerCase()
    if (!q) return base
    return base.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        String(t.id).includes(q) ||
        String(t.author?.username ?? '').toLowerCase().includes(q),
    )
  }, [list, me, search])

  const showAuthorCol = me?.role === 'laborant'

  return (
    <div className="tickets-page">
      <div className="tickets-toolbar">
        <h1 className="page-title tickets-toolbar__title">Заявки</h1>
        <Link className="btn" to="/tickets/new">
          + Новая заявка
        </Link>
      </div>

      <section className="panel">
        <div className="panel__header">
          <h2 className="panel__title">История заявок</h2>
        </div>
        <div className="panel__body">
          <div className="doc-filters" style={{ marginBottom: 12 }}>
            <label className="field" style={{ margin: 0 }}>
              <span className="field__label">Поиск по названию, № или автору</span>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="…" />
            </label>
          </div>
          {loading && <p className="muted">Загрузка…</p>}
          {err && <div className="alert alert--error">{err}</div>}
          {!loading && !err && (
            <div className="table-scroll">
              <table className="data-table data-table--clickable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Тип</th>
                    <th>Статус</th>
                    {showAuthorCol && <th>Автор</th>}
                    <th>Создана</th>
                    <th>Обновлена</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={showAuthorCol ? 8 : 7} className="muted">
                        Заявок пока нет
                      </td>
                    </tr>
                  ) : (
                    visible.map((t) => (
                      <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)}>
                        <td>{t.id}</td>
                        <td>{t.name}</td>
                        <td>{ticketTypeRu(String(t.type))}</td>
                        <td>
                          <span className={statusClass(String(t.status))}>{ticketStatusRu(String(t.status))}</span>
                        </td>
                        {showAuthorCol && (
                          <td>
                            {t.author?.username ?? t.author_id}
                            {me && t.author_id === me.id && (
                              <span className="status-badge status-badge--draft" style={{ marginLeft: 6, fontSize: '0.75rem' }}>
                                моя
                              </span>
                            )}
                          </td>
                        )}
                        <td>{fmt(t.created_at)}</td>
                        <td>{fmt(t.updated_at)}</td>
                        <td>
                          <EntityLink className="attr-table__link" to={`/tickets/${t.id}`} onClick={(e) => e.stopPropagation()}>
                            Открыть
                          </EntityLink>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
