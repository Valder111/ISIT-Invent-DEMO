import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EntityLink } from '../../shared/ui/EntityLink'
import { ApiError } from '../../shared/api/http'
import { typesApi, type EquipmentCategory } from '../../shared/api/equipment'
import { EquipmentDetailShell } from './EquipmentDetailShell'

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

export function CategoryDetailPage() {
  const { id } = useParams()
  const numId = Number(id)
  const [item, setItem] = useState<EquipmentCategory | null>(null)
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
        const c = await typesApi.get(numId)
        if (!cancelled) setItem(c)
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

  if (loading) return <p className="muted">Загрузка…</p>
  if (err || !item) return <div className="alert alert--error">{err ?? 'Не найдено'}</div>

  return (
    <EquipmentDetailShell
      title={`Категория: ${item.name}`}
      imageUrl={item.img_url}
      rows={[
        { label: 'ID', value: item.id },
        { label: 'Название', value: item.name },
        { label: 'Описание', value: item.description || '—' },
        { label: 'Комментарий', value: item.comment || '—' },
        { label: 'Активна', value: item.is_active ? 'Да' : 'Нет' },
        { label: 'Создана', value: fmt(item.created_at) },
        { label: 'Обновлена', value: fmt(item.updated_at) },
      ]}
    >
      <p className="detail-links">
        <EntityLink className="attr-table__link" to={`/equipment?level=model&parent=${item.id}`}>
          Все модели этой категории
        </EntityLink>
      </p>
    </EquipmentDetailShell>
  )
}
