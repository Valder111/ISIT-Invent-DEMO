import { useCallback, useEffect, useState } from 'react'
import { AttachedDocumentsPanel } from '../../shared/components/AttachedDocumentsPanel'
import { modelDocumentsApi } from '../../shared/api/entityDocuments'
import { useParams } from 'react-router-dom'
import { EntityLink } from '../../shared/ui/EntityLink'
import { ApiError } from '../../shared/api/http'
import { modelsApi, type EquipmentModel } from '../../shared/api/equipment'
import { isDemoBuild } from '../../shared/lib/demoEnv'
import { EquipmentDetailShell } from './EquipmentDetailShell'

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

export function ModelDetailPage() {
  const { id } = useParams()
  const numId = Number(id)
  const [item, setItem] = useState<EquipmentModel | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      try {
        const m = await modelsApi.get(numId)
        if (!cancelled) setItem(m)
      } catch (e) {
        if (!cancelled) setErr(e instanceof ApiError ? e.message : 'Ошибка загрузки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [numId])

  const loadPublicDocs = useCallback(() => modelDocumentsApi.list(numId, true), [numId])

  if (loading) return <p className="muted">Загрузка…</p>
  if (err || !item) return <div className="alert alert--error">{err ?? 'Не найдено'}</div>

  const catId = item.type?.id ?? item.type_id

  return (
    <EquipmentDetailShell
      title={`Модель: ${item.name}`}
      imageUrl={item.img_url}
      rows={[
        { label: 'ID', value: item.id },
        { label: 'Название', value: item.name },
        {
          label: 'Категория',
          value: (
            <EntityLink className="attr-table__link" to={`/equipment/category/${catId}`}>
              {item.type?.name ?? `Категория #${catId}`}
            </EntityLink>
          ),
        },
        { label: 'Описание', value: item.description || '—' },
        { label: 'Расходник', value: item.is_consumable ? 'Да' : 'Нет' },
        {
          label: item.is_consumable ? 'Остаток на складе' : 'Количество экземпляров',
          value: item.count,
        },
        { label: 'Комментарий', value: item.comment || '—' },
        { label: 'Активна', value: item.is_active ? 'Да' : 'Нет' },
        { label: 'Создана', value: fmt(item.created_at) },
        { label: 'Обновлена', value: fmt(item.updated_at) },
      ]}
    >
      {!item.is_consumable && (
        <p className="detail-links detail-links--row">
          <EntityLink className="attr-table__link" to={`/equipment?level=instance&parent=${item.id}`}>
            Все экземпляры этой модели
          </EntityLink>
          {item.count > 0 && !isDemoBuild() && (
            <a
              className="btn btn--secondary btn--sm"
              href={`/api/models/${item.id}/qr-labels.pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Этикетки для печати
            </a>
          )}
        </p>
      )}
      {item.is_consumable && <p className="muted detail-links">Экземпляры оборудования для модели расходного материала не ведутся — только остаток на складе (поле выше).</p>}
      <AttachedDocumentsPanel load={loadPublicDocs} />
    </EquipmentDetailShell>
  )
}
