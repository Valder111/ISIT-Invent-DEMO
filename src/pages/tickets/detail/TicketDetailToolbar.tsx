import { Link } from 'react-router-dom'

export function TicketDetailToolbar({
  ticketId,
  canEdit,
  editing,
  onEditClick,
}: {
  ticketId: number
  canEdit: boolean
  editing: boolean
  onEditClick: () => void
}) {
  return (
    <div className="tickets-toolbar">
      <h1 className="page-title tickets-toolbar__title">Заявка #{ticketId}</h1>
      <Link className="btn btn--secondary btn--sm" to="/tickets">
        К списку
      </Link>
      {canEdit && !editing && (
        <button type="button" className="btn btn--sm" onClick={onEditClick}>
          Редактировать черновик
        </button>
      )}
    </div>
  )
}
