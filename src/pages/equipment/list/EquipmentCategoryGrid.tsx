import { EntityLink } from '../../../shared/ui/EntityLink'
import type { EquipmentCategory } from '../../../shared/api/equipment'
import { SafeImage } from '../../../shared/ui/SafeImage'
import type { EquipmentCardSize } from '../equipmentCardSize'
import { EquipmentCategoryPreviewMeta } from './EquipmentCardPreviewMeta'
import { fmtScore, type Level } from './equipmentListUtils'

export function EquipmentCategoryGrid({
  rows,
  semanticActive,
  cardSize,
  setLevel,
}: {
  rows: { item: EquipmentCategory; score: number }[]
  semanticActive: boolean
  cardSize: EquipmentCardSize
  setLevel: (next: Level, parent?: number) => void
}) {
  const gridClass = cardSize === 'compact' ? 'equipment-grid equipment-grid--compact' : 'equipment-grid'
  return (
    <div className={gridClass}>
      {rows.map(({ item: c, score }) => (
        <article key={c.id} className={cardSize === 'compact' ? 'equipment-card equipment-card--compact' : 'equipment-card'}>
          <div className="equipment-card__thumb">
            <SafeImage src={c.img_url} alt="" />
          </div>
          <div className="equipment-card__main">
            <h2 className="equipment-card__title">
              {c.name}
              {semanticActive && score > 0 && <span className="score-badge" title="Релевантность">{fmtScore(score)}</span>}
            </h2>
            <EquipmentCategoryPreviewMeta item={c} />
            <div className="equipment-card__actions">
              <button type="button" className="btn btn--sm" onClick={() => setLevel('model', c.id)}>
                Модели
              </button>
              <EntityLink className="btn btn--ghost btn--sm" to={`/equipment/category/${c.id}`}>
                Подробнее
              </EntityLink>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
