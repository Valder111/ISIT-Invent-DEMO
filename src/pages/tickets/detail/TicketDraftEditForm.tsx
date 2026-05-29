import type { FormEvent } from 'react'
import type { TicketType } from '../../../shared/api/tickets'

export function TicketDraftEditForm({
  formType,
  formName,
  formDesc,
  formComment,
  onTypeChange,
  onNameChange,
  onDescChange,
  onCommentChange,
  saveErr,
  pending,
  onSubmit,
  onCancel,
}: {
  formType: TicketType
  formName: string
  formDesc: string
  formComment: string
  onTypeChange: (v: TicketType) => void
  onNameChange: (v: string) => void
  onDescChange: (v: string) => void
  onCommentChange: (v: string) => void
  saveErr: string | null
  pending: boolean
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
}) {
  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel__header">
        <h2 className="panel__title">Редактирование черновика</h2>
      </div>
      <div className="panel__body form-grid">
        {saveErr && <div className="alert alert--error">{saveErr}</div>}
        <label className="field">
          <span className="field__label">Тип</span>
          <select className="select" value={formType} onChange={(e) => onTypeChange(e.target.value as TicketType)}>
            <option value="repair">Ремонт</option>
            <option value="network">Сеть</option>
            <option value="hardware">Оборудование</option>
            <option value="software">ПО</option>
          </select>
        </label>
        <label className="field">
          <span className="field__label">Название</span>
          <input className="input" value={formName} onChange={(e) => onNameChange(e.target.value)} required maxLength={200} />
        </label>
        <label className="field">
          <span className="field__label">Описание</span>
          <textarea className="textarea" value={formDesc} onChange={(e) => onDescChange(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Комментарий</span>
          <textarea className="textarea" value={formComment} onChange={(e) => onCommentChange(e.target.value)} />
        </label>
        <div className="actions-row">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button type="button" className="btn btn--ghost" disabled={pending} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    </form>
  )
}
