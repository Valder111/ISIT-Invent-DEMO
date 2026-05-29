import { EntityLink } from '../../../shared/ui/EntityLink'
import type { Ticket } from '../../../shared/api/tickets'
import { ticketStatusRu, ticketTypeRu } from '../../../shared/lib/ruLabels'
import { fmt, statusClass } from './ticketPanelUtils'

export function TicketRow({
  ticket: t,
  canLaborantAct,
  canCancel,
  canAdminHardDelete,
  currentUserId,
  pendingId,
  onAction,
  onHardDelete,
}: {
  ticket: Ticket
  canLaborantAct: boolean
  canCancel: boolean
  canAdminHardDelete: boolean
  currentUserId?: number
  pendingId: number | null
  onAction: (id: number, kind: 'complete' | 'reject' | 'cancel') => void
  onHardDelete: (id: number) => void
}) {
  const assignedToMe = t.laborant_id != null && currentUserId != null && t.laborant_id === currentUserId
  const showLaborantActions = canLaborantAct && t.status === 'in_progress' && assignedToMe
  const showCancel =
    canCancel &&
    t.status !== 'draft' &&
    t.status !== 'cancelled' &&
    t.status !== 'done' &&
    !showLaborantActions

  return (
    <tr>
      <td>{t.id}</td>
      <td>
        <EntityLink to={`/tickets/${t.id}`}>{t.name}</EntityLink>
      </td>
      <td>{ticketTypeRu(String(t.type))}</td>
      <td>
        <span className={statusClass(String(t.status))}>{ticketStatusRu(String(t.status))}</span>
      </td>
      <td>{t.author?.username ?? t.author_id}</td>
      <td>{fmt(t.updated_at)}</td>
      <td>
        <div className="panel-tickets__actions">
          {showLaborantActions && (
            <>
              <button type="button" className="btn btn--sm" disabled={pendingId === t.id} onClick={() => onAction(t.id, 'complete')}>
                Завершить
              </button>
              <button type="button" className="btn btn--ghost btn--sm" disabled={pendingId === t.id} onClick={() => onAction(t.id, 'reject')}>
                Отклонить
              </button>
            </>
          )}
          {showCancel && (
            <button type="button" className="btn btn--ghost btn--sm" disabled={pendingId === t.id} onClick={() => onAction(t.id, 'cancel')}>
              Отменить
            </button>
          )}
          {canAdminHardDelete && (t.status === 'done' || t.status === 'cancelled') && (
            <button
              type="button"
              className="btn btn--ghost btn--sm panel-tickets__btn-danger"
              disabled={pendingId === t.id}
              onClick={() => onHardDelete(t.id)}
            >
              Удалить из БД
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
