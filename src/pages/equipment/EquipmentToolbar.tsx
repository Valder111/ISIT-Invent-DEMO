import { Link } from 'react-router-dom'
import { useMobileLayout } from '../../shared/lib/useMobileLayout'
import type { EquipmentCardSize } from './equipmentCardSize'

type SortKey = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc'

export function EquipmentToolbar({
  search,
  sort,
  canGoBack,
  smart,
  cardSize,
  onSearchChange,
  onSortChange,
  onSmartChange,
  onCardSizeChange,
  onBack,
}: {
  search: string
  sort: SortKey
  canGoBack: boolean
  smart: boolean
  cardSize: EquipmentCardSize
  onSearchChange: (value: string) => void
  onSortChange: (value: SortKey) => void
  onSmartChange: (value: boolean) => void
  onCardSizeChange: (value: EquipmentCardSize) => void
  onBack: () => void
}) {
  const mobile = useMobileLayout()
  const searchPlaceholder = mobile
    ? smart
      ? 'ИИ-поиск: высокая нагрузка…'
      : 'Поиск по названию…'
    : smart
      ? 'Умный поиск: опишите своими словами…'
      : 'Поиск по названию…'
  const smartLabel = mobile && smart ? 'ИИ · высокая нагрузка' : 'Умный поиск'
  const smartTitle = mobile
    ? smart
      ? 'Семантический поиск (ИИ): высокая нагрузка на процессор и память устройства'
      : 'Семантический поиск (ИИ) — ищет по смыслу запроса'
    : 'Семантический поиск (AI) — ищет по смыслу запроса'

  return (
    <div className={`toolbar${mobile && smart ? ' toolbar--ai-mobile' : ''}`}>
      <input
        className="toolbar__search"
        type="search"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Поиск"
      />
      <label className="smart-toggle" title={smartTitle}>
        <input
          type="checkbox"
          checked={smart}
          onChange={(e) => onSmartChange(e.target.checked)}
          aria-label="Переключатель умного поиска"
        />
        <span className="smart-toggle__label">{smartLabel}</span>
      </label>
      <Link to="/equipment/search" className="btn btn--ghost btn--sm" title="Глобальный поиск по всем категориям, моделям и экземплярам">
        Глобальный поиск
      </Link>
      <select
        className="toolbar__sort"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        aria-label="Сортировка"
        disabled={smart && search.trim().length >= 2}
        title={smart && search.trim().length >= 2 ? 'При умном поиске сортировка — по релевантности' : undefined}
      >
        <option value="name_asc">По алфавиту (А→Я)</option>
        <option value="name_desc">По алфавиту (Я→А)</option>
        <option value="date_desc">По дате добавления (новые)</option>
        <option value="date_asc">По дате добавления (старые)</option>
      </select>
      <button
        type="button"
        className="btn btn--secondary btn--sm"
        onClick={() => onCardSizeChange(cardSize === 'large' ? 'compact' : 'large')}
        title={cardSize === 'large' ? 'Показать компактные карточки' : 'Показать крупные карточки'}
        aria-pressed={cardSize === 'compact'}
        aria-label="Размер карточек списка"
      >
        {cardSize === 'large' ? 'Компактные карточки' : 'Крупные карточки'}
      </button>
      {canGoBack && (
        <button type="button" className="btn btn--secondary btn--sm" onClick={onBack}>
          Назад
        </button>
      )}
    </div>
  )
}
