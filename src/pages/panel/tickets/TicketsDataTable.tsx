import type { Ticket } from '../../../shared/api/tickets'
import { TicketRow } from './TicketRow'

export function TicketsDataTable({
  rows,
  canLaborantAct,
  canCancel,
  canAdminHardDelete,
  currentUserId,
  pendingId,
  onAction,
  onHardDelete,
}: {
  rows: Ticket[]
  canLaborantAct: boolean
  canCancel: boolean
  canAdminHardDelete: boolean
  currentUserId?: number
  pendingId: number | null
  onAction: (id: number, kind: 'complete' | 'reject' | 'cancel') => void
  onHardDelete: (id: number) => void
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Автор</th>
            <th>Обновлена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="muted">
                Нет записей
              </td>
            </tr>
          ) : (
            rows.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                canLaborantAct={canLaborantAct}
                canCancel={canCancel}
                canAdminHardDelete={canAdminHardDelete}
                currentUserId={currentUserId}
                pendingId={pendingId}
                onAction={onAction}
                onHardDelete={onHardDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
