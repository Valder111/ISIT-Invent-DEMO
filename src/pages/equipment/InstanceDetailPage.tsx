import { useCallback, useEffect, useState } from 'react'
import { AttachedDocumentsPanel } from '../../shared/components/AttachedDocumentsPanel'
import { instanceDocumentsApi } from '../../shared/api/entityDocuments'
import { useParams } from 'react-router-dom'
import { EntityLink } from '../../shared/ui/EntityLink'
import { ApiError } from '../../shared/api/http'
import { instancesApi, type EquipmentInstance } from '../../shared/api/equipment'
import { equipmentStatusRu, ynRu } from '../../shared/lib/ruLabels'
import { isDemoBuild } from '../../shared/lib/demoEnv'
import { EquipmentDetailShell } from './EquipmentDetailShell'

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString('ru-RU')
  } catch {
    return iso
  }
}

export function InstanceDetailPage() {
  const { id, qrToken } = useParams()
  const numId = Number(id)
  const byQr = Boolean(qrToken?.trim())
  const [item, setItem] = useState<EquipmentInstance | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (byQr) {
        if (!qrToken?.trim()) {
          setErr('Неверная ссылка с этикетки')
          setLoading(false)
          return
        }
      } else if (!Number.isFinite(numId)) {
        setErr('Некорректный адрес страницы')
        setLoading(false)
        return
      }
      setLoading(true)
      setErr(null)
      try {
        const inst = byQr ? await instancesApi.getByQrToken(qrToken!) : await instancesApi.get(numId)
        if (!cancelled) setItem(inst)
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
  }, [numId, qrToken, byQr])

  const instanceId = item?.id ?? (Number.isFinite(numId) ? numId : 0)
  const loadPublicDocs = useCallback(
    () => (instanceId > 0 ? instanceDocumentsApi.list(instanceId, true) : Promise.resolve([])),
    [instanceId],
  )

  if (loading) return <p className="muted">Загрузка…</p>
  if (err || !item) return <div className="alert alert--error">{err ?? 'Не найдено'}</div>

  const model = item.model
  const modelId = model?.id ?? item.model_id
  const catId = model?.type?.id ?? model?.type_id

  return (
    <EquipmentDetailShell
      title={item.name || model?.name || `Экземпляр #${item.id}`}
      imageUrl={item.img_url}
      rows={[
        { label: 'ID', value: item.id },
        { label: 'Название', value: item.name || '—' },
        {
          label: 'Модель',
          value: (
            <EntityLink className="attr-table__link" to={`/equipment/model/${modelId}`}>
              {model?.name ?? `Модель #${modelId}`}
            </EntityLink>
          ),
        },
        {
          label: 'Категория',
          value: catId ? (
            <EntityLink className="attr-table__link" to={`/equipment/category/${catId}`}>
              {model?.type?.name ?? `Категория #${catId}`}
            </EntityLink>
          ) : (
            '—'
          ),
        },
        { label: 'Инв. номер', value: item.invent_number },
        {
          label: 'Заводской номер',
          value: item.factory_number?.trim() ? item.factory_number.trim() : '—',
        },
        { label: 'Статус', value: equipmentStatusRu(item.status) },
        { label: 'Описание', value: item.description || '—' },
        {
          label: 'Локация',
          value: item.location ? `${item.location.name} (#${item.location.id})` : '—',
        },
        { label: 'Комментарий', value: item.comment || '—' },
        { label: 'Активен', value: ynRu(item.is_active) },
        { label: 'Создан', value: fmt(item.created_at) },
        { label: 'Обновлён', value: fmt(item.updated_at) },
      ]}
    >
      {!isDemoBuild() && (
        <div className="equipment-qr-block">
          <h3 className="equipment-qr-block__title">Этикетка для печати</h3>
          <p className="muted equipment-qr-block__hint">
            На этикетке указаны инвентарный и заводской номер и код для сканирования. Отсканируйте его, чтобы открыть
            карточку этого экземпляра на телефоне или планшете.
          </p>
          <div className="equipment-qr-block__actions">
            <a
              className="btn btn--secondary btn--sm"
              href={`/api/equipment/${item.id}/qr-label.pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Открыть этикетку для печати
            </a>
          </div>
          {item.qr_img_url ? (
            <img className="equipment-qr-block__preview" src={item.qr_img_url} alt="Код для сканирования на этикетке" />
          ) : null}
        </div>
      )}
      <AttachedDocumentsPanel load={loadPublicDocs} />
    </EquipmentDetailShell>
  )
}
