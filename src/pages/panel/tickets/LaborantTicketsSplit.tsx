import type { Ticket } from '../../../shared/api/tickets'
import { TicketsDataTable } from './TicketsDataTable'

export function LaborantTicketsSplit({
  mine,
  others,
  canLaborantAct,
  canCancel,
  canAdminHardDelete,
  currentUserId,
  pendingId,
  onAction,
  onHardDelete,
}: {
  mine: Ticket[]
  others: Ticket[]
  canLaborantAct: boolean
  canCancel: boolean
  canAdminHardDelete: boolean
  currentUserId?: number
  pendingId: number | null
  onAction: (id: number, kind: 'complete' | 'reject' | 'cancel') => void
  onHardDelete: (id: number) => void
}) {
  const tableProps = {
    canLaborantAct,
    canCancel,
    canAdminHardDelete,
    currentUserId,
    pendingId,
    onAction,
    onHardDelete,
  }

  return (
    <>
      <h3 className="panel__subtitle panel-tickets__subtitle">Мои заявки</h3>
      <TicketsDataTable rows={mine} {...tableProps} />
      <h3 className="panel__subtitle panel-tickets__subtitle panel-tickets__subtitle--section">Заявки других пользователей</h3>
      <TicketsDataTable rows={others} {...tableProps} />
    </>
  )
}
