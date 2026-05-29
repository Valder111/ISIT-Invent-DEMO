import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../shared/api/http'
import { browseStorage, deleteStorageObject, presignGet, uploadFile, type ListedStorageObject } from '../../shared/api/files'
import { isDemoBuild } from '../../shared/lib/demoEnv'
import { formatBytes, formatDateTime } from '../../shared/lib/format'
import { MAX_DOCUMENT_BYTES, MAX_IMAGE_BYTES } from '../../shared/lib/uploadLimits'
import { useConfirmDialog } from '../../shared/ui/useConfirmDialog'
import '../../css/panel.css'

const PREFIX_OPTIONS = ['users', 'types', 'models', 'equipment', 'docs', 'uploads'] as const

export function PanelStorageSection() {
  const { ask, dialog } = useConfirmDialog()
  const [prefix, setPrefix] = useState<string>('users')
  const [items, setItems] = useState<ListedStorageObject[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [actionErr, setActionErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const loadPage = useCallback(
    async (append: boolean, cursor?: string) => {
      if (append) setPending(true)
      else {
        setLoading(true)
        setLoadErr(null)
      }
      try {
        const data = await browseStorage({
          prefix,
          recursive: true,
          limit: 80,
          cursor,
        })
        setItems((prev) => (append ? [...prev, ...data.items] : data.items))
        setNextCursor(data.next_cursor ?? null)
      } catch (e) {
        setLoadErr(e instanceof ApiError ? e.message : 'Ошибка списка')
      } finally {
        setLoading(false)
        setPending(false)
      }
    },
    [prefix],
  )

  useEffect(() => {
    void loadPage(false, undefined)
  }, [loadPage])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setActionErr(null)
    setPending(true)
    try {
      await uploadFile(f, prefix)
      await loadPage(false, undefined)
    } catch (ex) {
      setActionErr(ex instanceof ApiError ? ex.message : 'Ошибка загрузки')
    } finally {
      setPending(false)
    }
  }

  function requestDelete(o: ListedStorageObject) {
    ask(
      {
        message: `Вы уверены? Объект «${o.key}» будет удалён из хранилища. Это действие необратимо.`,
        danger: true,
        confirmLabel: 'Удалить',
      },
      async () => {
        setActionErr(null)
        setPending(true)
        try {
          await deleteStorageObject(o.key)
          setItems((prev) => prev.filter((x) => x.key !== o.key))
        } catch (ex) {
          setActionErr(ex instanceof ApiError ? ex.message : 'Ошибка удаления')
        } finally {
          setPending(false)
        }
      },
    )
  }

  async function openPreview(key: string) {
    try {
      const { url } = await presignGet(key, 120)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setActionErr('Не удалось получить ссылку на файл')
    }
  }

  return (
    <>
      {dialog}
    <section className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Изображения и файлы</h2>
      </div>
      <div className="panel__body">
        {isDemoBuild() && (
          <div className="app-header__demo-watermark panel-storage__demo-note" role="note">
            В демонстрационной версии используется локальное хранилище данных. Не все коллекции отображаются.
          </div>
        )}
        <p className="muted" style={{ marginBottom: 16 }}>
          Просмотр объектов по префиксу, загрузка и удаление. Будьте осторожны: удаление затрагивает только хранилище; записи в базе могут
          сохранить старые ключи. Лимиты загрузки: изображения — до {formatBytes(MAX_IMAGE_BYTES)}, документы (префикс{' '}
          <code>docs</code>) — до {formatBytes(MAX_DOCUMENT_BYTES)}.
        </p>

        <div className="log-toolbar" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <label className="field" style={{ margin: 0 }}>
            <span className="field__label">Префикс</span>
            <select className="select" value={prefix} onChange={(e) => setPrefix(e.target.value)}>
              {PREFIX_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={(e) => void onUpload(e)} />
          <button type="button" className="btn btn--secondary btn--sm" disabled={pending} onClick={() => fileRef.current?.click()}>
            Загрузить в этот префикс
          </button>
          <button type="button" className="btn btn--secondary btn--sm" disabled={loading} onClick={() => void loadPage(false, undefined)}>
            Обновить список
          </button>
        </div>

        {actionErr && <div className="alert alert--error alert--page">{actionErr}</div>}
        {loadErr && <div className="alert alert--error alert--page">{loadErr}</div>}
        {loading && <p className="muted">Загрузка…</p>}

        {!loading && !loadErr && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Файл</th>
                  <th>Размер</th>
                  <th>Изменён</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      Объектов нет
                    </td>
                  </tr>
                ) : (
                  items.map((o) => (
                    <tr key={o.key}>
                      <td>
                        {o.filename ? (
                          <div className="panel-storage__filename" title={o.filename}>
                            {o.filename}
                          </div>
                        ) : null}
                        <code style={{ fontSize: 13, display: 'block', marginTop: o.filename ? 4 : 0 }}>
                          {o.key}
                        </code>
                      </td>
                      <td>{formatBytes(o.size)}</td>
                      <td>{formatDateTime(o.last_modified)}</td>
                      <td className="data-table__actions">
                        <div className="panel-storage__cell-actions table-action-buttons">
                          <button type="button" className="btn btn--ghost btn--sm" disabled={pending} onClick={() => void openPreview(o.key)}>
                            Открыть
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm panel-tickets__btn-danger"
                            disabled={pending}
                            onClick={() => requestDelete(o)}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {nextCursor && (
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn--secondary btn--sm" disabled={pending} onClick={() => void loadPage(true, nextCursor)}>
              {pending ? 'Загрузка…' : 'Ещё'}
            </button>
          </div>
        )}
      </div>
    </section>
    </>
  )
}
