import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AttachedDocumentsPanel } from '../../../shared/components/AttachedDocumentsPanel'
import { EntityDocumentsManageModal } from '../../../shared/components/EntityDocumentsManageModal'
import { ticketDocumentsApi } from '../../../shared/api/entityDocuments'
import { Navigate, useParams } from 'react-router-dom'
import '../../../css/tickets.css'
import '../../../css/ticket-detail-page.css'
import { ApiError } from '../../../shared/api/http'
import { useAuthState } from '../../../shared/auth/useAuthState'
import { ticketsApi, type Ticket, type TicketItem, type TicketType } from '../../../shared/api/tickets'
import { canViewTicket } from '../../../shared/lib/ticketVisibility'
import { EquipmentInstancePickerModal } from '../../../shared/components/EquipmentInstancePickerModal'
import { TicketDetailToolbar } from './TicketDetailToolbar'
import { TicketDraftEditForm } from './TicketDraftEditForm'
import { TicketSummaryTable } from './TicketSummaryTable'
import { TicketLaborantActions } from './TicketLaborantActions'
import { TicketDraftManagerSection } from './TicketDraftManagerSection'
import { TicketItemsSection } from './TicketItemsSection'
import { useConfirmDialog } from '../../../shared/ui/useConfirmDialog'
import { TicketCancelReasonModal } from '../../../shared/ui/TicketCancelReasonModal'

export function TicketDetailPage() {
  const { ask, dialog } = useConfirmDialog()
  const { me } = useAuthState()
  const { id } = useParams()
  const numId = Number(id)

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [itemErr, setItemErr] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  const [formType, setFormType] = useState<TicketType>('repair')
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formComment, setFormComment] = useState('')

  const [addItemComment, setAddItemComment] = useState('')

  const canEdit = useMemo(() => {
    if (!ticket || !me) return false
    return ticket.status === 'draft' && ticket.author_id === me.id
  }, [ticket, me])

  const canManageDocs = useMemo(() => {
    if (!ticket || !me) return false
    if (ticket.status === 'done' || ticket.status === 'cancelled') return false
    return me.role === 'admin' || me.role === 'inventory_manager'
  }, [ticket, me])
  const [docsOpen, setDocsOpen] = useState(false)
  const loadPublicDocs = useCallback(() => ticketDocumentsApi.list(numId, true), [numId])

  const isLaborantLike = me?.role === 'laborant' || me?.role === 'admin'

  const canAcceptLaborant = useMemo(() => {
    if (!ticket || !me || !isLaborantLike) return false
    return ticket.status === 'in_progress' && (ticket.laborant_id == null || ticket.laborant_id === undefined)
  }, [ticket, me, isLaborantLike])

  const canCompleteOrReject = useMemo(() => {
    if (!ticket || !me || !isLaborantLike) return false
    if (ticket.status !== 'in_progress') return false
    return ticket.laborant_id === me.id
  }, [ticket, me, isLaborantLike])

  async function reload() {
    if (!Number.isFinite(numId)) return
    const t = await ticketsApi.get(numId)
    setTicket(t)
    setFormType((t.type as TicketType) || 'repair')
    setFormName(t.name)
    setFormDesc(t.description)
    setFormComment(t.comment)
  }

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!Number.isFinite(numId)) {
        setErr('Некорректный ID')
        setLoading(false)
        return
      }
      setLoading(true)
      setErr(null)
      setForbidden(false)
      try {
        const t = await ticketsApi.get(numId)
        if (cancelled) return
        if (me && !canViewTicket(t, me)) {
          setForbidden(true)
          setTicket(null)
          return
        }
        setTicket(t)
        setFormType((t.type as TicketType) || 'repair')
        setFormName(t.name)
        setFormDesc(t.description)
        setFormComment(t.comment)
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 403) {
          setForbidden(true)
          setTicket(null)
          return
        }
        setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [numId, me?.id, me?.role])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    if (!ticket) return
    setPending(true)
    setSaveErr(null)
    try {
      await ticketsApi.update(ticket.id, {
        type: formType,
        name: formName,
        description: formDesc,
        comment: formComment,
      })
      await reload()
      setEditing(false)
    } catch (e) {
      setSaveErr(e instanceof ApiError ? e.message : 'Ошибка сохранения')
    } finally {
      setPending(false)
    }
  }

  async function addItemByInstanceId(instanceId: number) {
    if (!ticket) return
    setPickerOpen(false)
    setPending(true)
    setItemErr(null)
    try {
      await ticketsApi.addItem(ticket.id, {
        instance_id: instanceId,
        quantity: 1,
        comment: addItemComment,
      })
      await reload()
    } catch (e) {
      setItemErr(e instanceof ApiError ? e.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  function requestRemoveItem(it: TicketItem) {
    if (!ticket) return
    const label = it.instance?.name || it.model?.name || `позиция №${it.id}`
    ask(
      {
        message: `Вы уверены? «${label}» будет удалена из черновика заявки.`,
        danger: true,
        confirmLabel: 'Удалить',
      },
      async () => {
        setPending(true)
        setItemErr(null)
        try {
          const eqId = it.instance?.id ?? it.instance_id
          if (eqId) {
            await ticketsApi.deleteItem(ticket.id, eqId)
          } else {
            await ticketsApi.deleteItemById(ticket.id, it.id)
          }
          await reload()
        } catch (e) {
          setItemErr(e instanceof ApiError ? e.message : 'Ошибка')
        } finally {
          setPending(false)
        }
      },
    )
  }

  async function onFormTicket() {
    if (!ticket) return
    setPending(true)
    setItemErr(null)
    try {
      await ticketsApi.form(ticket.id)
      await reload()
    } catch (e) {
      setItemErr(e instanceof ApiError ? e.message : 'Ошибка формирования')
    } finally {
      setPending(false)
    }
  }

  async function onAccept() {
    if (!ticket) return
    setPending(true)
    setItemErr(null)
    try {
      await ticketsApi.accept(ticket.id)
      await reload()
    } catch (e) {
      setItemErr(e instanceof ApiError ? e.message : 'Ошибка приёма')
    } finally {
      setPending(false)
    }
  }

  async function onComplete() {
    if (!ticket) return
    setPending(true)
    setItemErr(null)
    try {
      await ticketsApi.complete(ticket.id)
      await reload()
    } catch (e) {
      setItemErr(e instanceof ApiError ? e.message : 'Ошибка завершения')
    } finally {
      setPending(false)
    }
  }

  async function confirmReject(cancelReason: string) {
    if (!ticket) return
    setPending(true)
    setItemErr(null)
    try {
      await ticketsApi.reject(ticket.id, { cancel_reason: cancelReason })
      await reload()
    } catch (e) {
      setItemErr(e instanceof ApiError ? e.message : 'Ошибка отклонения')
      throw e
    } finally {
      setPending(false)
    }
  }

  function requestDeleteDraft() {
    if (!ticket) return
    ask(
      {
        message: `Вы уверены? Черновик заявки «${ticket.name}» будет удалён.`,
        danger: true,
        confirmLabel: 'Удалить',
      },
      async () => {
        setPending(true)
        setItemErr(null)
        try {
          await ticketsApi.delete(ticket.id)
          window.location.href = '/tickets'
        } catch (e) {
          setItemErr(e instanceof ApiError ? e.message : 'Ошибка удаления')
        } finally {
          setPending(false)
        }
      },
    )
  }

  if (forbidden) return <Navigate to="/tickets" replace />

  if (loading) return <p className="muted">Загрузка…</p>
  if (err || !ticket) return <div className="alert alert--error">{err ?? 'Не найдено'}</div>

  return (
    <div className="ticket-detail">
      {dialog}
      {rejectModalOpen && ticket && (
        <TicketCancelReasonModal
          title={`Отклонить заявку «${ticket.name}»`}
          confirmLabel="Подтвердить отклонение"
          onClose={() => setRejectModalOpen(false)}
          onConfirm={confirmReject}
        />
      )}
      {pickerOpen && (
        <EquipmentInstancePickerModal onClose={() => setPickerOpen(false)} onPick={(id) => void addItemByInstanceId(id)} disabled={pending} />
      )}
      <TicketDetailToolbar ticketId={ticket.id} canEdit={canEdit} editing={editing} onEditClick={() => setEditing(true)} />

      {itemErr ? <div className="alert alert--error alert--page">{itemErr}</div> : null}

      {canEdit && editing ? (
        <TicketDraftEditForm
          formType={formType}
          formName={formName}
          formDesc={formDesc}
          formComment={formComment}
          onTypeChange={setFormType}
          onNameChange={setFormName}
          onDescChange={setFormDesc}
          onCommentChange={setFormComment}
          saveErr={saveErr}
          pending={pending}
          onSubmit={onSave}
          onCancel={() => void reload().then(() => setEditing(false))}
        />
      ) : (
        <>
          <TicketSummaryTable ticket={ticket} />
          <TicketLaborantActions
            pending={pending}
            canAcceptLaborant={canAcceptLaborant}
            canCompleteOrReject={canCompleteOrReject}
            onAccept={() => void onAccept()}
            onComplete={() => void onComplete()}
            onReject={() => setRejectModalOpen(true)}
          />
          {canEdit && (
            <TicketDraftManagerSection
              pending={pending}
              addItemComment={addItemComment}
              onAddItemCommentChange={setAddItemComment}
              onFormTicket={() => void onFormTicket()}
              onDeleteDraft={() => requestDeleteDraft()}
              onOpenPicker={() => setPickerOpen(true)}
            />
          )}
          <TicketItemsSection ticket={ticket} canEdit={canEdit} pending={pending} onRemoveItem={requestRemoveItem} />
          {canManageDocs && (
            <p style={{ marginTop: 16 }}>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setDocsOpen(true)}>
                Управление документами
              </button>
            </p>
          )}
          <AttachedDocumentsPanel load={loadPublicDocs} />
        </>
      )}
      {docsOpen && ticket && canManageDocs && (
        <EntityDocumentsManageModal
          kind="ticket"
          entityId={ticket.id}
          entityLabel={ticket.name}
          onClose={() => setDocsOpen(false)}
        />
      )}
    </div>
  )
}
