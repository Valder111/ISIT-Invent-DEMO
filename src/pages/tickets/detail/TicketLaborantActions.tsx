export function TicketLaborantActions({
  pending,
  canAcceptLaborant,
  canCompleteOrReject,
  onAccept,
  onComplete,
  onReject,
}: {
  pending: boolean
  canAcceptLaborant: boolean
  canCompleteOrReject: boolean
  onAccept: () => void
  onComplete: () => void
  onReject: () => void
}) {
  if (!canAcceptLaborant && !canCompleteOrReject) return null

  return (
    <div className="actions-row ticket-detail__laborant-actions">
      {canAcceptLaborant && (
        <button type="button" className="btn" disabled={pending} onClick={onAccept}>
          Принять в работу
        </button>
      )}
      {canCompleteOrReject && (
        <>
          <button type="button" className="btn btn--secondary" disabled={pending} onClick={onComplete}>
            Завершить
          </button>
          <button type="button" className="btn btn--ghost" disabled={pending} onClick={onReject}>
            Отклонить
          </button>
        </>
      )}
    </div>
  )
}
