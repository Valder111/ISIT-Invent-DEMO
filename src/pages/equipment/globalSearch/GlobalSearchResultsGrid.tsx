import { EntityLink } from '../../../shared/ui/EntityLink'
import { SafeImage } from '../../../shared/ui/SafeImage'
import type { GlobalSearchCard } from './globalSearchTypes'
import { TYPE_LABEL, fmtScore } from './globalSearchTypes'

export function GlobalSearchResultsGrid({ cards }: { cards: GlobalSearchCard[] }) {
  if (cards.length === 0) return null

  return (
    <div className="equipment-grid">
      {cards.map((card) => (
        <article key={`${card.type}-${card.id}`} className="equipment-card">
          <div className="equipment-card__thumb">
            <SafeImage src={card.imgUrl} alt="" />
          </div>
          <h2 className="equipment-card__title">
            {card.title}
            <span className="score-badge" title="Релевантность">
              {fmtScore(card.score)}
            </span>
          </h2>
          <p className="equipment-card__meta">
            <span className={`type-pill type-pill--${card.type}`}>{TYPE_LABEL[card.type]}</span>
            <span> · {card.meta}</span>
          </p>
          <div className="equipment-card__actions">
            <EntityLink className="btn btn--sm" to={card.href}>
              Подробнее
            </EntityLink>
          </div>
        </article>
      ))}
    </div>
  )
}
