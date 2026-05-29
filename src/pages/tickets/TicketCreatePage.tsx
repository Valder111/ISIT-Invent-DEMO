import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../css/tickets.css'
import { ApiError } from '../../shared/api/http'
import { ticketsApi, type TicketType } from '../../shared/api/tickets'

export function TicketCreatePage() {
  const navigate = useNavigate()
  const [type, setType] = useState<TicketType>('repair')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [comment, setComment] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setErr(null)
    try {
      const t = await ticketsApi.createDraft({ type, name, description, comment })
      navigate(`/tickets/${t.id}`, { replace: true })
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка сохранения')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Новая заявка</h1>
      <p className="muted ticket-create__intro">
        После сохранения вы перейдёте к карточке заявки: при необходимости прикрепите экземпляры оборудования и нажмите «Сформировать заявку»
        (оборудование необязательно).
      </p>

      <form className="panel" onSubmit={saveDraft}>
        <div className="panel__header">
          <h2 className="panel__title">Данные заявки</h2>
        </div>
        <div className="panel__body form-grid">
          {err && <div className="alert alert--error">{err}</div>}

          <label className="field">
            <span className="field__label">Тип заявки</span>
            <select className="select" value={type} onChange={(e) => setType(e.target.value as TicketType)}>
              <option value="repair">Ремонт</option>
              <option value="network">Сеть</option>
              <option value="hardware">Оборудование</option>
              <option value="software">ПО</option>
            </select>
          </label>

          <label className="field">
            <span className="field__label">Краткое название</span>
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

          <div className="actions-row">
            <button className="btn" type="submit" disabled={pending}>
              {pending ? 'Сохранение…' : 'Сохранить как черновик'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
