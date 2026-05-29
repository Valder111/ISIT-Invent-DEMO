import { EntityLink } from '../../../shared/ui/EntityLink'
import type { EquipmentModel } from '../../../shared/api/equipment'
import { SafeImage } from '../../../shared/ui/SafeImage'
import type { EquipmentCardSize } from '../equipmentCardSize'
import { EquipmentModelPreviewMeta } from './EquipmentCardPreviewMeta'
import { fmtScore, type Level } from './equipmentListUtils'

export function EquipmentModelGrid({
  rows,
  semanticActive,
  cardSize,
  setLevel,
}: {
  rows: { item: EquipmentModel; score: number }[]
  semanticActive: boolean
  cardSize: EquipmentCardSize
  setLevel: (next: Level, parent?: number) => void
}) {
  const gridClass = cardSize === 'compact' ? 'equipment-grid equipment-grid--compact' : 'equipment-grid'
  return (
    <div className={gridClass}>
      {rows.map(({ item: m, score }) => (
        <article key={m.id} className={cardSize === 'compact' ? 'equipment-card equipment-card--compact' : 'equipment-card'}>
          <div className="equipment-card__thumb">
            <SafeImage src={m.img_url} alt="" />
          </div>
          <div className="equipment-card__main">
            <h2 className="equipment-card__title">
              {m.name}
              {semanticActive && score > 0 && <span className="score-badge" title="Релевантность">{fmtScore(score)}</span>}
            </h2>
            <EquipmentModelPreviewMeta item={m} />
            <div className="equipment-card__actions">
              <button
                type="button"
                className="btn btn--sm"
                disabled={m.is_consumable}
                title={
                  m.is_consumable
                    ? 'У модели расходного материала нет отдельных экземпляров — учёт по остатку на складе'
                    : undefined
                }
                onClick={() => setLevel('instance', m.id)}
              >
                Экземпляры
              </button>
              <EntityLink className="btn btn--ghost btn--sm" to={`/equipment/model/${m.id}`}>
                Подробнее
              </EntityLink>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
