import type { FormEvent } from 'react'

export function WriteOffsForm({
  mode,
  setMode,
  resetSelection,
  itemId,
  itemLabel,
  modelId,
  modelLabel,
  quantity,
  setQuantity,
  name,
  setName,
  actNumber,
  setActNumber,
  reason,
  setReason,
  comment,
  setComment,
  formErr,
  pending,
  onOpenInstancePicker,
  onOpenModelPicker,
  onSubmit,
}: {
  mode: 'instance' | 'consumable'
  setMode: (m: 'instance' | 'consumable') => void
  resetSelection: () => void
  itemId: number | null
  itemLabel: string
  modelId: number | null
  modelLabel: string
  quantity: string
  setQuantity: (v: string) => void
  name: string
  setName: (v: string) => void
  actNumber: string
  setActNumber: (v: string) => void
  reason: string
  setReason: (v: string) => void
  comment: string
  setComment: (v: string) => void
  formErr: string | null
  pending: boolean
  onOpenInstancePicker: () => void
  onOpenModelPicker: () => void
  onSubmit: (e: FormEvent) => void
}) {
  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel__header">
        <h2 className="panel__title">Новое списание</h2>
      </div>
      <div className="panel__body form-grid">
        {formErr && <div className="alert alert--error">{formErr}</div>}

        <fieldset className="field writeoffs-page__fieldset">
          <legend className="field__label">Тип</legend>
          <label className="writeoffs-page__radio-label">
            <input
              type="radio"
              checked={mode === 'instance'}
              onChange={() => {
                setMode('instance')
                resetSelection()
              }}
            />{' '}
            Экземпляр оборудования
          </label>
          <label>
            <input
              type="radio"
              checked={mode === 'consumable'}
              onChange={() => {
                setMode('consumable')
                resetSelection()
              }}
            />{' '}
            Расходник (модель + количество)
          </label>
        </fieldset>

        {mode === 'instance' ? (
          <div className="field">
            <span className="field__label">Экземпляр</span>
            <div className="writeoffs-page__picker-row">
              <button type="button" className="btn btn--secondary btn--sm" disabled={pending} onClick={onOpenInstancePicker}>
                Выбрать экземпляр…
              </button>
              {itemId != null && (
                <span className="muted">
                  ID {itemId}
                  {itemLabel ? ` — ${itemLabel}` : ''}
                </span>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="field">
              <span className="field__label">Модель расходника</span>
              <div className="writeoffs-page__picker-row">
                <button type="button" className="btn btn--secondary btn--sm" disabled={pending} onClick={onOpenModelPicker}>
                  Выбрать модель…
                </button>
                {modelId != null && (
                  <span className="muted">
                    ID {modelId}
                    {modelLabel ? ` — ${modelLabel}` : ''}
                  </span>
                )}
              </div>
            </div>
            <label className="field">
              <span className="field__label">Количество</span>
              <input className="input" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} min={1} />
            </label>
          </>
        )}

        <label className="field">
          <span className="field__label">Название акта</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
        </label>
        <label className="field">
          <span className="field__label">Номер акта (уникальный)</span>
          <input className="input" value={actNumber} onChange={(e) => setActNumber(e.target.value)} required maxLength={128} />
        </label>
        <label className="field">
          <span className="field__label">Причина</span>
          <textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <label className="field">
          <span className="field__label">Комментарий</span>
          <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} />
        </label>

        <div className="actions-row">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? 'Отправка…' : 'Списать'}
          </button>
        </div>
      </div>
    </form>
  )
}
