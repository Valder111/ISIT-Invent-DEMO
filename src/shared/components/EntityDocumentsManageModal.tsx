import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/http'
import { uploadFile } from '../api/files'
import {
  instanceDocumentsApi,
  linkablePlatformDocuments,
  modelDocumentsApi,
  ticketDocumentsApi,
  type DocumentAttachBody,
  type EntityDocument,
} from '../api/entityDocuments'
import { formatBytes } from '../lib/format'
import { MAX_DOCUMENT_BYTES } from '../lib/uploadLimits'
import { useConfirmDialog } from '../ui/useConfirmDialog'

type EntityKind = 'model' | 'instance' | 'ticket'

const apiByKind = {
  model: modelDocumentsApi,
  instance: instanceDocumentsApi,
  ticket: ticketDocumentsApi,
} as const

export function EntityDocumentsManageModal({
  kind,
  entityId,
  entityLabel,
  onClose,
}: {
  kind: EntityKind
  entityId: number
  entityLabel: string
  onClose: () => void
}) {
  const { ask, dialog } = useConfirmDialog()
  const api = apiByKind[kind]
  const [attached, setAttached] = useState<EntityDocument[]>([])
  const [linkable, setLinkable] = useState<EntityDocument[]>([])
  const [selectedLinkId, setSelectedLinkId] = useState<number | ''>('')
  const [err, setErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const uploadRef = useRef<HTMLInputElement | null>(null)

  const reload = useCallback(async () => {
    const [a, l] = await Promise.all([api.list(entityId), linkablePlatformDocuments()])
    setAttached(a)
    setLinkable(l)
  }, [api, entityId])

  useEffect(() => {
    void reload().catch((e) => setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки'))
  }, [reload])

  async function onLink() {
    if (selectedLinkId === '') return
    setPending(true)
    setErr(null)
    try {
      await api.attach(entityId, { document_id: selectedLinkId })
      setSelectedLinkId('')
      await reload()
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка привязки')
    } finally {
      setPending(false)
    }
  }

  function requestDetach(docId: number, filename: string) {
    ask(
      {
        message: `Вы уверены? Документ «${filename}» будет откреплён от карточки. Файл останется на платформе.`,
        danger: true,
        confirmLabel: 'Открепить',
      },
      async () => {
        setPending(true)
        setErr(null)
        try {
          await api.detach(entityId, docId)
          await reload()
        } catch (e) {
          setErr(e instanceof ApiError ? e.message : 'Ошибка открепления')
        } finally {
          setPending(false)
        }
      },
    )
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPending(true)
    setErr(null)
    try {
      const { key } = await uploadFile(file, 'docs')
      const body: DocumentAttachBody = {
        object_key: key,
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
        size: file.size,
        comment: '',
        is_public: true,
      }
      await api.attach(entityId, body)
      await reload()
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка загрузки')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      {dialog}
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title">Документы: {entityLabel}</h3>
        <p className="muted panel-equip__muted-tight">
          К карточке можно привязать только публичные документы. Новые файлы при прикреплении создаются как публичные.
        </p>
        {err && <div className="alert alert--error">{err}</div>}

        <h4 className="panel__subtitle" style={{ marginTop: 12 }}>
          Прикреплено
        </h4>
        {attached.length === 0 ? (
          <p className="muted">Нет документов.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
            {attached.map((d) => (
              <li key={d.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer">
                    {d.filename}
                  </a>
                ) : (
                  <span>{d.filename}</span>
                )}
                <span className="muted" style={{ fontSize: 13 }}>
                  {d.is_public ? 'публичный' : 'приватный'}
                </span>
                <button type="button" className="btn btn--ghost btn--sm" disabled={pending} onClick={() => requestDetach(d.id, d.filename)}>
                  Открепить
                </button>
              </li>
            ))}
          </ul>
        )}

        <h4 className="panel__subtitle">Привязать с платформы</h4>
        <div className="doc-filters" style={{ marginBottom: 12 }}>
          <label className="field" style={{ margin: 0, flex: 1 }}>
            <span className="field__label">Публичный документ</span>
            <select
              className="select"
              value={selectedLinkId === '' ? '' : String(selectedLinkId)}
              onChange={(e) => setSelectedLinkId(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">— выберите —</option>
              {linkable.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename} ({formatBytes(d.size)})
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn--sm" disabled={pending || selectedLinkId === ''} onClick={() => void onLink()}>
            Привязать
          </button>
        </div>

        <h4 className="panel__subtitle">Загрузить и прикрепить</h4>
        <input ref={uploadRef} type="file" style={{ display: 'none' }} onChange={(e) => void onUpload(e)} />
        <button type="button" className="btn btn--secondary btn--sm" disabled={pending} onClick={() => uploadRef.current?.click()}>
          Выбрать файл
        </button>
        <span className="muted" style={{ marginLeft: 8 }}>
          до {formatBytes(MAX_DOCUMENT_BYTES)}
        </span>

        <div className="modal-actions" style={{ marginTop: 20 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
