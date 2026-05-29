import { useState } from 'react'
import { ApiError } from '../../../shared/api/http'
import { locationsApi, type Location } from '../../../shared/api/equipment'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'

export function LocationModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Location | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setErr(null)
    try {
      if (initial) {
        await locationsApi.update(initial.id, {
          name: name || undefined,
          description: description || undefined,
          comment: comment || undefined,
        })
      } else {
        await locationsApi.create({ name, description, comment })
      }
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  async function performRemove() {
    if (!initial) return
    setConfirmDelete(false)
    setPending(true)
    setErr(null)
    try {
      await locationsApi.delete(initial.id)
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      {confirmDelete && initial && (
        <ConfirmModal
          message={`Вы уверены? Локация «${initial.name}» будет удалена.`}
          danger
          confirmLabel="Удалить"
          pending={pending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void performRemove()}
        />
      )}
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{initial ? 'Редактирование локации' : 'Новая локация'}</h3>
        <form className="panel-form-grid" onSubmit={(e) => void save(e)}>
          {err && <div className="alert alert--error">{err}</div>}
          <label className="field">
            <span className="field__label">Название</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
          </label>
          <label className="field">
            <span className="field__label">Описание</span>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="field">
            <span className="field__label">Комментарий</span>
            <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} />
          </label>
          <div className="modal-actions">
            <div className="modal-actions__left">
              <button className="btn" type="submit" disabled={pending}>
                Сохранить
              </button>
              {initial && (
                <button className="btn btn--ghost" type="button" disabled={pending} onClick={() => setConfirmDelete(true)}>
                  Удалить
                </button>
              )}
            </div>
            <div className="modal-actions__right">
              <button className="btn btn--ghost" type="button" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
