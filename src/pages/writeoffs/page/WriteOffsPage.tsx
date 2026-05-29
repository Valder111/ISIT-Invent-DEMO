import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../../../shared/api/http'
import { writeoffsApi, type WriteOff } from '../../../shared/api/writeoffs'
import '../../../css/panel.css'
import '../../../css/write-offs-page.css'
import { WriteOffsForm } from './WriteOffsForm'
import { WriteOffsHistoryTable } from './WriteOffsHistoryTable'
import { WriteOffsPickerModals } from './WriteOffsPickerModals'

export function WriteOffsPage() {
  const [rows, setRows] = useState<WriteOff[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [formErr, setFormErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [mode, setMode] = useState<'instance' | 'consumable'>('instance')
  const [itemId, setItemId] = useState<number | null>(null)
  const [itemLabel, setItemLabel] = useState('')
  const [modelId, setModelId] = useState<number | null>(null)
  const [modelLabel, setModelLabel] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [instancePickerOpen, setInstancePickerOpen] = useState(false)
  const [modelPickerOpen, setModelPickerOpen] = useState(false)

  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [actNumber, setActNumber] = useState('')
  const [comment, setComment] = useState('')

  function resetSelection() {
    setItemId(null)
    setItemLabel('')
    setModelId(null)
    setModelLabel('')
  }

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data } = await writeoffsApi.list({ limit: 200, offset: 0 })
      setRows(data)
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setFormErr(null)
    try {
      if (mode === 'instance') {
        if (itemId == null || itemId <= 0) {
          setFormErr('Выберите экземпляр из каталога')
          return
        }
        await writeoffsApi.create({
          item_id: itemId,
          quantity: 1,
          name: name.trim(),
          reason: reason.trim(),
          act_number: actNumber.trim(),
          comment: comment.trim() || undefined,
        })
      } else {
        const q = Number(quantity)
        if (modelId == null || modelId <= 0) {
          setFormErr('Выберите модель расходника')
          return
        }
        if (!Number.isFinite(q) || q < 1) {
          setFormErr('Укажите количество ≥ 1')
          return
        }
        await writeoffsApi.create({
          model_id: modelId,
          quantity: q,
          name: name.trim(),
          reason: reason.trim(),
          act_number: actNumber.trim(),
          comment: comment.trim() || undefined,
        })
      }
      setName('')
      setReason('')
      setActNumber('')
      setComment('')
      resetSelection()
      setQuantity('1')
      await load()
    } catch (ex) {
      setFormErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Списание оборудования</h1>
      <p className="muted writeoffs-page__intro">Выберите экземпляр или модель расходника из каталога. Номер акта должен быть уникален.</p>

      <WriteOffsPickerModals
        instancePickerOpen={instancePickerOpen}
        modelPickerOpen={modelPickerOpen}
        pending={pending}
        onCloseInstance={() => setInstancePickerOpen(false)}
        onPickInstance={(id, displayName) => {
          setItemId(id)
          setItemLabel(displayName ?? `Экземпляр #${id}`)
          setInstancePickerOpen(false)
          setFormErr(null)
        }}
        onCloseModel={() => setModelPickerOpen(false)}
        onPickModel={(id, nm) => {
          setModelId(id)
          setModelLabel(nm)
          setModelPickerOpen(false)
          setFormErr(null)
        }}
      />

      <WriteOffsForm
        mode={mode}
        setMode={setMode}
        resetSelection={resetSelection}
        itemId={itemId}
        itemLabel={itemLabel}
        modelId={modelId}
        modelLabel={modelLabel}
        quantity={quantity}
        setQuantity={setQuantity}
        name={name}
        setName={setName}
        actNumber={actNumber}
        setActNumber={setActNumber}
        reason={reason}
        setReason={setReason}
        comment={comment}
        setComment={setComment}
        formErr={formErr}
        pending={pending}
        onOpenInstancePicker={() => setInstancePickerOpen(true)}
        onOpenModelPicker={() => setModelPickerOpen(true)}
        onSubmit={onSubmit}
      />

      <WriteOffsHistoryTable rows={rows} loading={loading} err={err} />
    </div>
  )
}
