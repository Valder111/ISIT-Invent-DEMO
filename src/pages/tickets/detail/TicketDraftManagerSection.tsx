export function TicketDraftManagerSection({
  pending,
  addItemComment,
  onAddItemCommentChange,
  onFormTicket,
  onDeleteDraft,
  onOpenPicker,
}: {
  pending: boolean
  addItemComment: string
  onAddItemCommentChange: (v: string) => void
  onFormTicket: () => void
  onDeleteDraft: () => void
  onOpenPicker: () => void
}) {
  return (
    <section className="panel ticket-detail__items">
      <div className="panel__header">
        <h2 className="panel__title">Черновик заявки</h2>
      </div>
      <div className="panel__body">
        <div className="actions-row ticket-detail__draft-actions">
          <button type="button" className="btn" disabled={pending} onClick={onFormTicket}>
            Сформировать заявку
          </button>
          <button type="button" className="btn btn--ghost" disabled={pending} onClick={onDeleteDraft}>
            Удалить черновик
          </button>
        </div>
        <p className="muted ticket-detail__muted-hint">
          Оборудование в заявке необязательно. При необходимости добавьте экземпляры из каталога ниже.
        </p>
        <label className="field">
          <span className="field__label">Комментарий к позиции</span>
          <input className="input" value={addItemComment} onChange={(e) => onAddItemCommentChange(e.target.value)} />
        </label>
        <div className="actions-row ticket-detail__picker-actions">
          <button type="button" className="btn btn--sm" disabled={pending} onClick={onOpenPicker}>
            Выбрать экземпляр…
          </button>
        </div>
      </div>
    </section>
  )
}
