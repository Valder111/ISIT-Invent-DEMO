import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/http'
import { browseStorage, presignGet, uploadFile, type ListedStorageObject } from '../api/files'
import { formatBytes } from '../lib/format'
import { MAX_IMAGE_BYTES } from '../lib/uploadLimits'
import { SafeImage } from './SafeImage'
import '../../css/panel.css'

function normPrefix(prefix?: string) {
  const p = prefix?.trim().replace(/^\//, '').replace(/\/$/, '') ?? ''
  return p || 'uploads'
}

function isImageRow(o: ListedStorageObject): boolean {
  const ct = o.content_type ?? ''
  if (ct.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(o.key)
}

function StorageLibraryModal({
  prefix,
  onClose,
  onSelect,
}: {
  prefix: string
  onClose: () => void
  onSelect: (key: string, previewUrl: string | null) => void
}) {
  const [items, setItems] = useState<ListedStorageObject[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const presignStarted = useRef<Set<string>>(new Set())

  async function loadPage(cursor?: string, append = false) {
    if (append) setLoadingMore(true)
    else {
      setLoading(true)
      setLoadErr(null)
    }
    try {
      const data = await browseStorage({ prefix, limit: 60, recursive: true, cursor })
      setItems((prev) => (append ? [...prev, ...data.items] : data.items))
      setNextCursor(data.next_cursor ?? null)
    } catch (e) {
      setLoadErr(e instanceof ApiError ? e.message : 'Ошибка списка')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    void loadPage(undefined, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / prefix
  }, [prefix])

  useEffect(() => {
    const pending = items.filter((o) => isImageRow(o) && !presignStarted.current.has(o.key)).slice(0, 32)
    if (pending.length === 0) return
    let cancelled = false
    pending.forEach((o) => presignStarted.current.add(o.key))
    void (async () => {
      const chunk: Record<string, string> = {}
      for (const o of pending) {
        if (cancelled) return
        try {
          const { url } = await presignGet(o.key, 180)
          chunk[o.key] = url
        } catch {
          /* нет доступа к presign или не изображение */
        }
      }
      if (!cancelled && Object.keys(chunk).length > 0) {
        setPreviews((prev) => ({ ...prev, ...chunk }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [items])

  async function chooseRow(o: ListedStorageObject) {
    let preview: string | null = previews[o.key] ?? null
    if (!preview && isImageRow(o)) {
      try {
        preview = (await presignGet(o.key, 300)).url
      } catch {
        preview = null
      }
    }
    onSelect(o.key, preview)
  }

  return (
    <div
      className="modal-backdrop modal-backdrop--picker"
      role="dialog"
      aria-modal
      aria-labelledby="storage-lib-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-card modal-card--picker" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="modal-card__title" id="storage-lib-title">
          Объекты в хранилище: <code>{prefix || '(корень)'}</code>
        </h3>
        {loading && <p className="muted">Загрузка списка…</p>}
        {loadErr && <div className="alert alert--error">{loadErr}</div>}
        {!loading && !loadErr && (
          <div className="modal-picker__table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Превью</th>
                  <th>Ключ</th>
                  <th>Размер</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      Нет объектов с этим префиксом
                    </td>
                  </tr>
                ) : (
                  items.map((o) => (
                    <tr key={o.key}>
                      <td style={{ width: 72 }}>
                        {previews[o.key] ? (
                          <SafeImage src={previews[o.key]} alt="" style={{ maxWidth: 64, maxHeight: 64, objectFit: 'contain' }} />
                        ) : isImageRow(o) ? (
                          <span className="muted">…</span>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <code style={{ wordBreak: 'break-all' }}>{o.key}</code>
                      </td>
                      <td>{formatBytes(o.size)}</td>
                      <td className="data-table__actions">
                        <button type="button" className="btn btn--sm" onClick={() => void chooseRow(o)}>
                          Выбрать
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-actions" style={{ marginTop: 12 }}>
          <div className="modal-actions__left">
            {nextCursor ? (
              <button type="button" className="btn btn--secondary btn--sm" disabled={loadingMore} onClick={() => void loadPage(nextCursor, true)}>
                {loadingMore ? 'Загрузка…' : 'Ещё'}
              </button>
            ) : null}
          </div>
          <div className="modal-actions__right">
            <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ImgUploadField({
  value,
  onChange,
  prefix,
  disabled,
  label = 'Изображение',
  existingPreviewUrl,
}: {
  value: string
  onChange: (key: string) => void
  prefix?: string
  disabled?: boolean
  label?: string
  /** Превью уже сохранённого изображения (например img_url с сервера) */
  existingPreviewUrl?: string | null
}) {
  const [err, setErr] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const browsePrefix = normPrefix(prefix)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || disabled) return
    setPending(true)
    setErr(null)
    try {
      const { key, url } = await uploadFile(file, prefix)
      onChange(key)
      setUploadPreviewUrl(url ?? null)
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Ошибка загрузки')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="field">
      <span className="field__label">{label}</span>
      {(uploadPreviewUrl || existingPreviewUrl || value) && (
        <div className="img-upload-preview">
          <SafeImage src={uploadPreviewUrl ?? existingPreviewUrl ?? undefined} alt="" />
        </div>
      )}
      <div className="img-upload-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          tabIndex={-1}
          aria-hidden
          disabled={disabled || pending}
          onChange={(e) => void onPick(e)}
        />
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={disabled || pending}
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить
        </button>
        <button type="button" className="btn btn--secondary btn--sm" disabled={disabled || pending} onClick={() => setLibraryOpen(true)}>
          Из хранилища
        </button>
        {pending && <span className="muted">Загрузка…</span>}
      </div>
      {value ? (
        <p className="muted img-upload-key">
          Файл выбран
        </p>
      ) : (
        <p className="muted">Файл не выбран</p>
      )}
      <p className="muted">Максимальный размер изображения: {formatBytes(MAX_IMAGE_BYTES)}</p>
      {err && <p className="alert alert--error alert--inline">{err}</p>}
      {libraryOpen && !disabled && (
        <StorageLibraryModal
          prefix={browsePrefix}
          onClose={() => setLibraryOpen(false)}
          onSelect={(key, url) => {
            onChange(key)
            setUploadPreviewUrl(url)
            setLibraryOpen(false)
            setErr(null)
          }}
        />
      )}
    </div>
  )
}
