import '../../css/panel.css'

export function ConfirmModal({
  title = 'Подтверждение',
  message = 'Вы уверены?',
  confirmLabel = 'Да',
  cancelLabel = 'Отмена',
  danger,
  pending,
  onConfirm,
  onCancel,
}: {
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="modal-backdrop modal-backdrop--confirm" role="presentation" onMouseDown={onCancel}>
      <div className="modal-card" role="alertdialog" aria-modal onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{title}</h3>
        <p className="modal-card__message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn"
            style={danger ? { background: 'var(--color-danger, #b91c1c)', color: '#fff' } : undefined}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
