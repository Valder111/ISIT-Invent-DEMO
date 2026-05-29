import type { Ticket } from '../../../shared/api/tickets'
import { ticketStatusRu, ticketTypeRu } from '../../../shared/lib/ruLabels'
import { fmt, statusClass } from './ticketDetailUtils'

export function TicketSummaryTable({ ticket }: { ticket: Ticket }) {
  return (
    <table className="attr-table attr-table--fit">
      <tbody>
        <tr>
          <th>ID</th>
          <td>{ticket.id}</td>
        </tr>
        <tr>
          <th>Название</th>
          <td>{ticket.name}</td>
        </tr>
        <tr>
          <th>Тип</th>
          <td>{ticketTypeRu(String(ticket.type))}</td>
        </tr>
        <tr>
          <th>Статус</th>
          <td>
            <span className={statusClass(String(ticket.status))}>{ticketStatusRu(String(ticket.status))}</span>
          </td>
        </tr>
        <tr>
          <th>Описание</th>
          <td>{ticket.description || '—'}</td>
        </tr>
        <tr>
          <th>Комментарий</th>
          <td>{ticket.comment || '—'}</td>
        </tr>
        {ticket.status === 'cancelled' && ticket.cancel_reason ? (
          <tr>
            <th>Обоснование отмены</th>
            <td>{ticket.cancel_reason}</td>
          </tr>
        ) : null}
        <tr>
          <th>Автор</th>
          <td>{ticket.author ? `${ticket.author.username} (${ticket.author.email})` : ticket.author_id}</td>
        </tr>
        <tr>
          <th>Исполнитель</th>
          <td>{ticket.laborant ? ticket.laborant.username : '—'}</td>
        </tr>
        <tr>
          <th>Создана</th>
          <td>{fmt(ticket.created_at)}</td>
        </tr>
        <tr>
          <th>Обновлена</th>
          <td>{fmt(ticket.updated_at)}</td>
        </tr>
      </tbody>
    </table>
  )
}
