import { EntityLink } from '../../../shared/ui/EntityLink'
import type { Ticket, TicketItem } from '../../../shared/api/tickets'

export function TicketItemsSection({
  ticket,
  canEdit,
  pending,
  onRemoveItem,
}: {
  ticket: Ticket
  canEdit: boolean
  pending: boolean
  onRemoveItem: (it: TicketItem) => void
}) {
  return (
    <section className="panel ticket-detail__items">
      <div className="panel__header">
        <h2 className="panel__title">Позиции заявки</h2>
      </div>
      <div className="panel__body">
        {!ticket.items || ticket.items.length === 0 ? (
          <p className="muted">Позиций нет</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Модель</th>
                  <th>Экземпляр</th>
                  <th>Кол-во</th>
                  <th>Комментарий</th>
                  {canEdit && <th />}
                </tr>
              </thead>
              <tbody>
                {ticket.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.model?.name ?? it.model_id}</td>
                    <td>
                      {it.instance ? (
                        <EntityLink className="attr-table__link" to={`/equipment/instance/${it.instance.id}`}>
                          {it.instance.name || `#${it.instance.id}`}
                        </EntityLink>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{it.quantity}</td>
                    <td>{it.comment || '—'}</td>
                    {canEdit && (
                      <td>
                        <button type="button" className="btn btn--ghost btn--sm" disabled={pending} onClick={() => onRemoveItem(it)}>
                          Убрать
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
