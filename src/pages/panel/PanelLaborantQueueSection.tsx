import { useCallback, useEffect, useMemo, useState } from 'react'
import { EntityLink } from '../../shared/ui/EntityLink'
import { ApiError } from '../../shared/api/http'
import { ticketsApi, type Ticket } from '../../shared/api/tickets'
import { useAuthState } from '../../shared/auth/useAuthState'
import { ticketStatusRu, ticketTypeRu } from '../../shared/lib/ruLabels'
import { TicketCancelReasonModal } from '../../shared/ui/TicketCancelReasonModal'
import '../../css/panel.css'
import '../../css/tickets.css'

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

export function PanelLaborantQueueSection() {
  const { me } = useAuthState()
  const [list, setList] = useState<Ticket[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionErr, setActionErr] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState<{ id: number; name: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const rows = await ticketsApi.list({ status: 'in_progress', panel: true })
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

  const visible = useMemo(() => {
    if (!list) return []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter((t) => t.name.toLowerCase().includes(q) || String(t.id).includes(q))
  }, [list, search])

  async function onAccept(id: number) {
    setPendingId(id)
    setActionErr(null)
    try {
      await ticketsApi.accept(id)
      await load()
    } catch (e) {
      setActionErr(e instanceof ApiError ? e.message : 'Не удалось принять')
    } finally {
      setPendingId(null)
    }
  }

  function openRejectModal(id: number) {
    const t = visible.find((row) => row.id === id)
    setRejectModal({ id, name: t?.name ?? `№${id}` })
  }

  async function confirmReject(cancelReason: string) {
    if (!rejectModal) return
    setPendingId(rejectModal.id)
    setActionErr(null)
    try {
      await ticketsApi.reject(rejectModal.id, { cancel_reason: cancelReason })
      await load()
    } catch (e) {
      setActionErr(e instanceof ApiError ? e.message : 'Не удалось отклонить')
      throw e
    } finally {
      setPendingId(null)
    }
  }

  return (
    <>
      {rejectModal && (
        <TicketCancelReasonModal
          title={`Отклонить заявку «${rejectModal.name}»`}
          confirmLabel="Подтвердить отклонение"
          onClose={() => setRejectModal(null)}
          onConfirm={confirmReject}
        />
      )}
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Обработка заявок</h2>
      </div>
      <div className="panel__body">
        <p className="muted" style={{ marginBottom: 12 }}>
          Очередь и ваши заявки в статусе <strong>{ticketStatusRu('in_progress')}</strong>. «Принять» назначает заявку на вас; «Отклонить» доступна только для уже назначенных вам.
        </p>
        {me && (
          <p className="muted" style={{ marginBottom: 12 }}>
            Вы вошли как <strong>{me.username}</strong>.
          </p>
        )}
        <div className="doc-filters" style={{ marginBottom: 12 }}>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Поиск по названию или №</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Запрос…" />
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void load()}>
            Обновить
          </button>
        </div>
        {actionErr && <div className="alert alert--error alert--page">{actionErr}</div>}
        {err && <div className="alert alert--error alert--page">{err}</div>}
        {loading && <p className="muted">Загрузка…</p>}
        {!loading && !err && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Автор</th>
                  <th>Создана</th>
                  <th>Исполнитель</th>
                  <th className="data-table__actions">Действия</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted">
                      Нет заявок в этом статусе
                    </td>
                  </tr>
                ) : (
                  visible.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <EntityLink to={`/tickets/${t.id}`}>#{t.id}</EntityLink>
                      </td>
                      <td>{t.name}</td>
                      <td>{ticketTypeRu(String(t.type))}</td>
                      <td>{t.author?.username ?? t.author_id}</td>
                      <td>{fmt(t.created_at)}</td>
                      <td>{t.laborant?.username ?? '—'}</td>
                      <td className="data-table__actions">
                        <div className="table-action-buttons">
                          <button
                            type="button"
                            className="btn btn--sm"
                            disabled={pendingId === t.id || t.laborant_id != null}
                            title={t.laborant_id != null ? 'Уже назначена' : 'Назначить на себя'}
                            onClick={() => void onAccept(t.id)}
                          >
                            {pendingId === t.id ? '…' : 'Принять'}
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            disabled={pendingId === t.id || t.laborant_id == null || (me != null && t.laborant_id !== me.id)}
                            title={t.laborant_id == null ? 'Сначала примите заявку' : me != null && t.laborant_id !== me.id ? 'Чужая заявка' : ''}
                            onClick={() => openRejectModal(t.id)}
                          >
                            {pendingId === t.id ? '…' : 'Отклонить'}
                          </button>
                        </div>
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
    </>
  )
}
