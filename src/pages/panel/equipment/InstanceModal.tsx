import { useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/http'
import { instancesApi, type EquipmentInstance, type EquipmentModel, type Location } from '../../../shared/api/equipment'
import { equipmentStatusRu } from '../../../shared/lib/ruLabels'
import { ImgUploadField } from '../../../shared/ui/ImgUploadField'
import { ConfirmModal } from '../../../shared/ui/ConfirmModal'

export function InstanceModal({
  models,
  locations,
  initial,
  onClose,
  onSaved,
}: {
  models: EquipmentModel[]
  locations: Location[]
  initial: EquipmentInstance | null
  onClose: () => void
  onSaved: () => void
}) {
  const [modelId, setModelId] = useState(initial?.model_id ?? (models[0]?.id ?? 0))
  const [locationId, setLocationId] = useState<number | ''>(initial?.location_id ?? '')
  const [inventNumber, setInventNumber] = useState(initial?.invent_number ?? 1)
  const [factoryNumber, setFactoryNumber] = useState(initial?.factory_number ?? '')
  const statusLocked = initial?.status === 'written_off'
  const [status, setStatus] = useState(initial?.status === 'broken' ? 'broken' : 'active')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [img, setImg] = useState(initial?.img ?? '')
  const [comment, setComment] = useState(initial?.comment ?? '')
  const [pending, setPending] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (initial) return
    const m = models.find((x) => x.id === modelId)
    if (m) {
      setName(m.name ?? '')
      setDescription(m.description ?? '')
    }
  }, [initial, models, modelId])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setErr(null)
    try {
      const factoryTrimmed = factoryNumber.trim()
      if (initial) {
        await instancesApi.update(initial.id, {
          location_id: locationId === '' ? null : locationId,
          factory_number: factoryTrimmed,
          ...(statusLocked ? {} : { status }),
          name,
          description: description || null,
          img,
          comment,
        })
      } else {
        await instancesApi.create({
          model_id: modelId,
          location_id: locationId === '' ? undefined : locationId,
          invent_number: inventNumber,
          factory_number: factoryTrimmed || undefined,
          status,
          name,
          description,
          img,
          comment,
        })
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
      await instancesApi.delete(initial.id)
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  if (!initial && models.length === 0) {
    return (
      <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
          <h3 className="modal-card__title">Нет подходящих моделей</h3>
          <p className="muted">
            Экземпляр можно создать только для модели без флага «Расходный материал». Добавьте такую модель на вкладке «Модели» или снимите флаг расходника.
          </p>
          <button type="button" className="btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      {confirmDelete && initial && (
        <ConfirmModal
          message={`Вы уверены? Экземпляр «${initial.name || `#${initial.id}`}» будет удалён (логически).`}
          danger
          pending={pending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => void performRemove()}
        />
      )}
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">{initial ? 'Редактирование экземпляра' : 'Новый экземпляр'}</h3>
        <form className="panel-form-grid" onSubmit={(e) => void save(e)}>
          {err && <div className="alert alert--error">{err}</div>}
          {!initial && (
            <>
              <p className="muted panel-equip__form-note">
                Имя и описание подставляются из выбранной модели; при необходимости отредактируйте вручную.
              </p>
              <label className="field">
                <span className="field__label">Модель</span>
                <select className="select" value={modelId} onChange={(e) => setModelId(Number(e.target.value))} required>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Инвентарный номер</span>
                <input className="input" type="number" min={1} value={inventNumber} onChange={(e) => setInventNumber(Number(e.target.value))} required />
              </label>
            </>
          )}
          {initial && (
            <label className="field">
              <span className="field__label">Инвентарный номер</span>
              <input className="input" type="number" value={initial.invent_number} readOnly disabled />
            </label>
          )}
          <label className="field">
            <span className="field__label">Заводской номер</span>
            <input
              className="input"
              value={factoryNumber}
              onChange={(e) => setFactoryNumber(e.target.value)}
              maxLength={255}
              placeholder="Например, SN-12345"
            />
          </label>
          <label className="field">
            <span className="field__label">Локация</span>
            <select
              className="select"
              value={locationId === '' ? '' : String(locationId)}
              onChange={(e) => setLocationId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">— не указана —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Статус</span>
            {statusLocked ? (
              <input className="input" value={equipmentStatusRu('written_off')} readOnly disabled />
            ) : (
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">{equipmentStatusRu('active')}</option>
                <option value="broken">{equipmentStatusRu('broken')}</option>
              </select>
            )}
          </label>
          <label className="field">
            <span className="field__label">Имя</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          </label>
          <label className="field">
            <span className="field__label">Описание</span>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <ImgUploadField prefix="equipment" value={img} onChange={setImg} existingPreviewUrl={initial?.img_url} />
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
