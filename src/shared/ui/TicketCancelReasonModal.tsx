import { useState } from 'react'
import { ApiError } from '../api/http'

const MIN_REASON_LEN = 3

export function TicketCancelReasonModal({
  title,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string
  confirmLabel: string
  onClose: () => void
  onConfirm: (cancelReason: string) => Promise<void>
}) {
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = reason.trim()
    if (trimmed.length < MIN_REASON_LEN) {
      setErr(`Укажите обоснование (не менее ${MIN_REASON_LEN} символов)`)
      return
    }
    setPending(true)
    setErr(null)
    try {
      await onConfirm(trimmed)
      onClose()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{title}</h3>
        <form className="panel-form-grid" onSubmit={(e) => void submit(e)}>
          {err && <div className="alert alert--error">{err}</div>}
          <label className="field">
            <span className="field__label">Обоснование отмены</span>
            <textarea
              className="textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={MIN_REASON_LEN}
              maxLength={2000}
              rows={4}
              placeholder="Опишите причину отмены заявки"
              autoFocus
            />
          </label>
          <div className="modal-actions">
            <div className="modal-actions__left">
              <button type="submit" className="btn btn--secondary" disabled={pending}>
                {confirmLabel}
              </button>
            </div>
            <div className="modal-actions__right">
              <button type="button" className="btn btn--ghost" disabled={pending} onClick={onClose}>
                Отмена
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
