import { EntityLink } from '../../../shared/ui/EntityLink'
import type { EquipmentInstance } from '../../../shared/api/equipment'
import { SafeImage } from '../../../shared/ui/SafeImage'
import type { EquipmentCardSize } from '../equipmentCardSize'
import { EquipmentInstancePreviewMeta } from './EquipmentCardPreviewMeta'
import { fmtScore } from './equipmentListUtils'

export function EquipmentInstanceGrid({
  rows,
  semanticActive,
  cardSize,
}: {
  rows: { item: EquipmentInstance; score: number }[]
  semanticActive: boolean
  cardSize: EquipmentCardSize
}) {
  const gridClass = cardSize === 'compact' ? 'equipment-grid equipment-grid--compact' : 'equipment-grid'
  return (
    <div className={gridClass}>
      {rows.map(({ item: i, score }) => (
        <article key={i.id} className={cardSize === 'compact' ? 'equipment-card equipment-card--compact' : 'equipment-card'}>
          <div className="equipment-card__thumb">
            <SafeImage src={i.img_url} alt="" />
          </div>
          <div className="equipment-card__main">
            <h2 className="equipment-card__title">
              {i.name || i.model?.name || `Экземпляр #${i.id}`}
              {semanticActive && score > 0 && <span className="score-badge" title="Релевантность">{fmtScore(score)}</span>}
            </h2>
            <EquipmentInstancePreviewMeta item={i} />
            <div className="equipment-card__actions">
            <EntityLink className="btn btn--sm" to={`/equipment/instance/${i.id}`}>
              Подробнее
            </EntityLink>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
