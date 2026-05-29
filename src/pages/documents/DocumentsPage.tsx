import { useEffect, useMemo, useRef, useState } from 'react'
import { EntityLink } from '../../shared/ui/EntityLink'
import { ApiError } from '../../shared/api/http'
import { documentsApi, type DocumentAttachBody, type PlatformDocument } from '../../shared/api/documents'
import { uploadFile } from '../../shared/api/files'
import type { UserRole } from '../../shared/api/auth'
import { useAuthState } from '../../shared/auth/useAuthState'
import { useConfirmDialog } from '../../shared/ui/useConfirmDialog'
import { formatBytes } from '../../shared/lib/format'
import { MAX_DOCUMENT_BYTES } from '../../shared/lib/uploadLimits'
import '../../css/panel.css'

export function DocumentsPage() {
  const { ask, dialog } = useConfirmDialog()
  const { me } = useAuthState()
  const [list, setList] = useState<PlatformDocument[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [pub, setPub] = useState<'all' | 'yes' | 'no'>('all')

  const role = me?.role as UserRole | undefined
  const canManage = role === 'admin' || role === 'inventory_manager' || role === 'laborant'

  function canDeleteRow(d: PlatformDocument): boolean {
    if (!me) return false
    if (canManage) return true
    const ownerId = d.uploaded_by_id ?? d.uploaded_by?.id
    return ownerId != null && ownerId === me.id
  }

  const [deletePendingId, setDeletePendingId] = useState<number | null>(null)

  function requestDelete(d: PlatformDocument) {
    if (!canDeleteRow(d)) return
    ask(
      {
        message: `Вы уверены? Документ «${d.filename}» будет удалён.`,
        danger: true,
        confirmLabel: 'Удалить',
      },
      async () => {
        setDeletePendingId(d.id)
        setErr(null)
        try {
          await documentsApi.delete(d.id)
          await load()
        } catch (e) {
          setErr(e instanceof ApiError ? e.message : 'Ошибка удаления')
        } finally {
          setDeletePendingId(null)
        }
      },
    )
  }

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      setList(await documentsApi.list())
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    if (!list) return []
    return list.filter((d) => {
      if (pub === 'yes' && !d.is_public) return false
      if (pub === 'no' && d.is_public) return false
      if (!q.trim()) return true
      const s = q.trim().toLowerCase()
      return (
        d.filename.toLowerCase().includes(s) ||
        d.comment.toLowerCase().includes(s) ||
        d.object_key.toLowerCase().includes(s) ||
        String(d.id).includes(s)
      )
    })
  }, [list, q, pub])

  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [uploadPublic, setUploadPublic] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !canManage) return
    setPending(true)
    setUploadErr(null)
    try {
      const { key } = await uploadFile(file, 'docs')
      const body: DocumentAttachBody = {
        object_key: key,
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
        size: file.size,
        comment: '',
        is_public: uploadPublic,
      }
      await documentsApi.attach(body)
      await load()
    } catch (ex) {
      setUploadErr(ex instanceof ApiError ? ex.message : 'Ошибка')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      {dialog}
    <div>
      <h1 className="page-title">Документы</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Глобальные документы платформы. Привязка к заявке или модели отображается в полях ниже, если сервер их отдаёт в списке.
      </p>

      <div className="doc-filters">
        <label className="field" style={{ margin: 0 }}>
          <span className="field__label">Поиск</span>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя файла, комментарий, ключ…" />
        </label>
        <label className="field" style={{ margin: 0 }}>
          <span className="field__label">Доступ</span>
          <select className="select" value={pub} onChange={(e) => setPub(e.target.value as typeof pub)}>
            <option value="all">Все</option>
            <option value="yes">Публичные</option>
            <option value="no">Только приватные</option>
          </select>
        </label>
        {canManage && (
          <div className="field" style={{ margin: 0 }}>
            <span className="field__label">Новый файл</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <input
                ref={uploadInputRef}
                type="file"
                style={{ display: 'none' }}
                disabled={pending}
                aria-hidden
                onChange={(e) => void onUploadFile(e)}
              />
              <button type="button" className="btn btn--secondary btn--sm" disabled={pending} onClick={() => uploadInputRef.current?.click()}>
                Загрузить
              </button>
              {pending && <span className="muted">Загрузка…</span>}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <input type="checkbox" checked={uploadPublic} onChange={(e) => setUploadPublic(e.target.checked)} />
                <span>Публичный документ</span>
              </label>
              <span className="muted">до {formatBytes(MAX_DOCUMENT_BYTES)}</span>
            </div>
          </div>
        )}
      </div>
      {uploadErr && <div className="alert alert--error">{uploadErr}</div>}

      {loading && <p className="muted">Загрузка…</p>}
      {err && <div className="alert alert--error">{err}</div>}
      {!loading && !err && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Файл</th>
                <th>Публичный</th>
                <th>Привязка</th>
                <th>Размер</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    Нет записей
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.filename}</td>
                    <td>{d.is_public ? 'да' : 'нет'}</td>
                    <td>
                      {d.ticket_id != null ? (
                        <EntityLink to={`/tickets/${d.ticket_id}`}>Заявка #{d.ticket_id}</EntityLink>
                      ) : d.model_id != null ? (
                        <EntityLink to={`/equipment/model/${d.model_id}`}>Модель #{d.model_id}</EntityLink>
                      ) : d.instance_id != null ? (
                        <EntityLink to={`/equipment/instance/${d.instance_id}`}>Экземпляр #{d.instance_id}</EntityLink>
                      ) : (
                        <span className="muted">Платформа</span>
                      )}
                    </td>
                    <td>{formatBytes(d.size)}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        {d.url ? (
                          <a href={d.url} target="_blank" rel="noreferrer">
                            Открыть
                          </a>
                        ) : (
                          <span className="muted">—</span>
                        )}
                        {canDeleteRow(d) && (
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            disabled={deletePendingId === d.id}
                            onClick={() => requestDelete(d)}
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  )
}
