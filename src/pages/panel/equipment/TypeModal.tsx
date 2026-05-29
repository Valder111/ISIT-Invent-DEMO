import { useState } from 'react'
import { ApiError } from '../../../shared/api/http'
import { typesApi, type EquipmentCategory } from '../../../shared/api/equipment'
import { ImgUploadField } from '../../../shared/ui/ImgUploadField'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'

export function TypeModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: EquipmentCategory | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [img, setImg] = useState(initial?.img ?? '')
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
        await typesApi.update(initial.id, { name, description: description || null, img, comment: comment || null })
      } else {
        await typesApi.create({ name, description, img, comment })
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
      await typesApi.delete(initial.id)
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
          message={`Вы уверены? Категория «${initial.name}» будет удалена.`}
          danger
          pending={pending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void performRemove()}
        />
      )}
      <div className="modal-card" role="dialog" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{initial ? 'Редактирование категории' : 'Новая категория'}</h3>
        <form className="panel-form-grid" onSubmit={(e) => void save(e)}>
          {err && <div className="alert alert--error">{err}</div>}
          <label className="field">
            <span className="field__label">Название</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </label>
          <label className="field">
            <span className="field__label">Описание</span>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <ImgUploadField prefix="types" value={img} onChange={setImg} existingPreviewUrl={initial?.img_url} />
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
