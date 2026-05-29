import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/http'
import type { UserRole } from '../../../shared/api/auth'
import { useAuthState } from '../../../shared/auth/useAuthState'
import { ticketsApi, type Ticket } from '../../../shared/api/tickets'
import type { PanelKind } from '../../../shared/auth/RequirePanel'
import { filterTicketsForViewer } from '../../../shared/lib/ticketVisibility'
import { ticketStatusRu, ticketTypeRu } from '../../../shared/lib/ruLabels'
import '../../../css/tickets.css'
import '../../../css/panel.css'
import '../../../css/panel-tickets.css'
import { useConfirmDialog } from '../../../shared/ui/useConfirmDialog'
import { TicketCancelReasonModal } from '../../../shared/ui/TicketCancelReasonModal'
import { LaborantTicketsSplit } from './LaborantTicketsSplit'
import { TicketsDataTable } from './TicketsDataTable'

export function PanelTicketsSection({ panel }: { panel: PanelKind }) {
  const { ask, dialog } = useConfirmDialog()
  const { me } = useAuthState()
  const [list, setList] = useState<Ticket[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [actionErr, setActionErr] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [cancelModal, setCancelModal] = useState<{
    id: number
    kind: 'reject' | 'cancel'
    name: string
  } | null>(null)

  const visibleList = useMemo(() => {
    if (!list || !me) return []
    const base = filterTicketsForViewer(list, me)
    const q = search.trim().toLowerCase()
    if (!q) return base
    return base.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        String(t.id).includes(q) ||
        String(t.author?.username ?? '').toLowerCase().includes(q),
    )
  }, [list, me, search])

  const role = me?.role as UserRole | undefined

  const canCancel = useMemo(() => role === 'admin' || role === 'inventory_manager', [role])
  const canLaborantAct = useMemo(() => role === 'admin' || role === 'laborant', [role])
  const canAdminHardDelete = useMemo(() => panel === 'admin' && role === 'admin', [panel, role])

  const laborantMineOthers = useMemo(() => {
    if (panel !== 'laborant' || role !== 'laborant' || !me) return null
    const mine = visibleList.filter((t) => t.author_id === me.id)
    const others = visibleList.filter((t) => t.author_id !== me.id)
    return { mine, others }
  }, [panel, role, me, visibleList])

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const rows = await ticketsApi.list({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        panel: true,
      })
      setList(rows)
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => {
    void load()
  }, [load])

  async function runAction(id: number, kind: 'complete' | 'reject' | 'cancel') {
    if (kind === 'reject' || kind === 'cancel') {
      const t = visibleList.find((row) => row.id === id)
      setCancelModal({ id, kind, name: t?.name ?? `№${id}` })
      return
    }
    setPendingId(id)
    setActionErr(null)
    try {
      await ticketsApi.complete(id)
      await load()
    } catch (e) {
      setActionErr(e instanceof ApiError ? e.message : 'Ошибка действия')
    } finally {
      setPendingId(null)
    }
  }

  async function confirmCancelWithReason(cancelReason: string) {
    if (!cancelModal) return
    const { id, kind } = cancelModal
    setPendingId(id)
    setActionErr(null)
    try {
      if (kind === 'reject') await ticketsApi.reject(id, { cancel_reason: cancelReason })
      else await ticketsApi.cancel(id, { cancel_reason: cancelReason })
      await load()
    } catch (e) {
      setActionErr(e instanceof ApiError ? e.message : 'Ошибка действия')
      throw e
    } finally {
      setPendingId(null)
    }
  }

  function requestHardDelete(id: number) {
    ask(
      {
        message: `Вы уверены? Заявка №${id} будет безвозвратно удалена из базы (все строки, вложения и позиции). Это действие нельзя отменить.`,
        danger: true,
        confirmLabel: 'Удалить',
      },
      async () => {
        setPendingId(id)
        setActionErr(null)
        try {
          await ticketsApi.adminHardDelete(id)
          await load()
        } catch (e) {
          setActionErr(e instanceof ApiError ? e.message : 'Ошибка удаления')
        } finally {
          setPendingId(null)
        }
      },
    )
  }

  const tableProps = {
    canLaborantAct,
    canCancel,
    canAdminHardDelete,
    currentUserId: me?.id,
    pendingId,
    onAction: runAction,
    onHardDelete: requestHardDelete,
  }

  return (
    <>
      {dialog}
      {cancelModal && (
        <TicketCancelReasonModal
          title={
            cancelModal.kind === 'reject'
              ? `Отклонить заявку «${cancelModal.name}»`
              : `Отменить заявку «${cancelModal.name}»`
          }
          confirmLabel={cancelModal.kind === 'reject' ? 'Подтвердить отклонение' : 'Подтвердить отмену'}
          onClose={() => setCancelModal(null)}
          onConfirm={confirmCancelWithReason}
        />
      )}
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Заявки ({panel === 'laborant' ? 'лаборант' : 'управление'})</h2>
      </div>
      <div className="panel__body">
        <div className="log-toolbar">
          <label className="field panel-tickets__field--tight">
            <span className="field__label">Поиск</span>
            <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Название, №, автор…" />
          </label>
          <label className="field panel-tickets__field--tight">
            <span className="field__label">Статус</span>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Все</option>
              <option value="draft">{ticketStatusRu('draft')}</option>
              <option value="in_progress">{ticketStatusRu('in_progress')}</option>
              <option value="done">{ticketStatusRu('done')}</option>
              <option value="cancelled">{ticketStatusRu('cancelled')}</option>
            </select>
          </label>
          <label className="field panel-tickets__field--tight">
            <span className="field__label">Тип</span>
            <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">Все</option>
              <option value="repair">{ticketTypeRu('repair')}</option>
              <option value="network">{ticketTypeRu('network')}</option>
              <option value="hardware">{ticketTypeRu('hardware')}</option>
              <option value="software">{ticketTypeRu('software')}</option>
            </select>
          </label>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => void load()}>
            Обновить
          </button>
        </div>

        {actionErr && <div className="alert alert--error alert--page">{actionErr}</div>}
        {loading && <p className="muted">Загрузка…</p>}
        {err && <div className="alert alert--error alert--page">{err}</div>}
        {!loading && !err && list && laborantMineOthers && (
          <LaborantTicketsSplit mine={laborantMineOthers.mine} others={laborantMineOthers.others} {...tableProps} />
        )}
        {!loading && !err && list && !laborantMineOthers && <TicketsDataTable rows={visibleList} {...tableProps} />}
        {(panel === 'laborant' || panel === 'admin' || panel === 'inventory') && (
          <p className="muted panel-tickets__hint">
            «Завершить» и «Отклонить» — только для принятых заявок. «Отменить» — для непринятых. «Удалить из БД» — для завершённых и отменённых.
          </p>
        )}
      </div>
    </section>
    </>
  )
}
