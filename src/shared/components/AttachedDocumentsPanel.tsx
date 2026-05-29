import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/http'
import type { EntityDocument } from '../api/entityDocuments'
import { formatBytes } from '../lib/format'

type Loader = () => Promise<EntityDocument[]>

export function AttachedDocumentsPanel({ title = 'Документы', load }: { title?: string; load: Loader }) {
  const [docs, setDocs] = useState<EntityDocument[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDocs = useCallback(() => load(), [load])

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setErr(null)
      try {
        const rows = await fetchDocs()
        if (!cancelled) setDocs(rows)
      } catch (e) {
        if (!cancelled) setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки документов')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [fetchDocs])

  return (
    <section className="attached-docs" style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{title}</h3>
      <p className="muted" style={{ fontSize: 14, marginBottom: 10 }}>
        Публичные файлы, прикреплённые к этой карточке.
      </p>
      {loading && <p className="muted">Загрузка…</p>}
      {err && <div className="alert alert--error">{err}</div>}
      {!loading && !err && docs && docs.length === 0 && <p className="muted">Нет прикреплённых документов.</p>}
      {!loading && !err && docs && docs.length > 0 && (
        <ul className="attached-docs__list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {docs.map((d) => (
            <li key={d.id} style={{ marginBottom: 8 }}>
              {d.url ? (
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="attached-docs__link">
                  {d.filename}
                </a>
              ) : (
                <span>{d.filename}</span>
              )}
              <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>
                {formatBytes(d.size)}
                {d.comment ? ` · ${d.comment}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
