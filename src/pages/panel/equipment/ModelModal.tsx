import { useState } from 'react'
import { ApiError } from '../../../shared/api/http'
import {
  modelsApi,
  type EquipmentCategory,
  type EquipmentModel,
  type ModelCreateBody,
  type ModelUpdateBody,
} from '../../../shared/api/equipment'
import { ImgUploadField } from '../../../shared/ui/ImgUploadField'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'

export function ModelModal({
  types,
  initial,
  onClose,
  onSaved,
}: {
  types: EquipmentCategory[]
  initial: EquipmentModel | null
  onClose: () => void
  onSaved: () => void
}) {
  const [typeId, setTypeId] = useState(initial?.type_id ?? (types[0]?.id ?? 0))
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [isConsumable, setIsConsumable] = useState(initial?.is_consumable ?? false)
  /** Строка поля остатка: пустое допустимо при вводе (не «залипает» на 0). */
  const [countDraft, setCountDraft] = useState(() => (initial?.is_consumable ? String(initial.count ?? '') : ''))
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
        const body: ModelUpdateBody = {
          type_id: typeId,
          name,
          description: description || null,
          is_consumable: isConsumable,
          img,
          comment: comment || null,
        }
        if (isConsumable) {
          const raw = countDraft.trim()
          const n = raw === '' ? 0 : Number(raw)
          if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
            setErr('Укажите целое неотрицательное количество на складе')
            return
          }
          body.count = n
        }
        await modelsApi.update(initial.id, body)
      } else {
        const body: ModelCreateBody = {
          type_id: typeId,
          name,
          description,
          is_consumable: isConsumable,
          img,
          comment,
        }
        if (isConsumable) {
          const raw = countDraft.trim()
          const n = raw === '' ? 0 : Number(raw)
          if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
            setErr('Укажите целое неотрицательное количество на складе')
            return
          }
          body.count = n
        }
        await modelsApi.create(body)
      }
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  if (!initial && types.length === 0) {
    return (
      <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
          <h3 className="modal-card__title">Нет категорий</h3>
          <p className="muted">Создайте категорию на вкладке «Категории (типы)».</p>
          <button type="button" className="btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  async function performRemove() {
    if (!initial) return
    setConfirmDelete(false)
    setPending(true)
    setErr(null)
    try {
      await modelsApi.delete(initial.id)
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
          message={`Вы уверены? Модель «${initial.name}» будет удалена.`}
          danger
          pending={pending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void performRemove()}
        />
      )}
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{initial ? 'Редактирование модели' : 'Новая модель'}</h3>
        <form className="panel-form-grid" onSubmit={(e) => void save(e)}>
          {err && <div className="alert alert--error">{err}</div>}
          <label className="field">
            <span className="field__label">Категория</span>
            <select className="select" value={typeId} onChange={(e) => setTypeId(Number(e.target.value))} required>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Название</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
          </label>
          <label className="field">
            <span className="field__label">Описание</span>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="field field--row">
            <input
              type="checkbox"
              checked={isConsumable}
              onChange={(e) => {
                const v = e.target.checked
                setIsConsumable(v)
                if (!v) {
                  setCountDraft('')
                } else {
                  setCountDraft(initial ? String(initial.count ?? '') : '')
                }
              }}
            />
            <span>Расходный материал</span>
          </label>
          {isConsumable ? (
            <label className="field">
              <span className="field__label">Количество на складе (остаток)</span>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={countDraft}
                onChange={(e) => {
                  const t = e.target.value
                  if (t === '' || /^\d+$/.test(t)) setCountDraft(t)
                }}
              />
            </label>
          ) : (
            <div className="field">
              <span className="field__label">Количество единиц</span>
              <p className="muted panel-equip__muted-tight">
                {initial
                  ? `Считается автоматически по активным экземплярам (сейчас в данных: ${initial.count}).`
                  : 'Для обычной модели не задаётся: после добавления экземпляров число обновится само.'}
              </p>
            </div>
          )}
          <ImgUploadField prefix="models" value={img} onChange={setImg} existingPreviewUrl={initial?.img_url} />
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
