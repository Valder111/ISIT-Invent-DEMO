import { Link } from 'react-router-dom'
import type { EquipmentCategory, EquipmentModel } from '../../shared/api/equipment'

type Level = 'category' | 'model' | 'instance'

export function EquipmentBreadcrumbs({
  level,
  category,
  model,
  onToCategories,
  onToModels,
}: {
  level: Level
  category: EquipmentCategory | null
  model: EquipmentModel | null
  onToCategories: () => void
  onToModels: (categoryId: number) => void
}) {
  return (
    <nav className="inline-crumbs" aria-label="Навигация по каталогу">
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault()
          onToCategories()
        }}
      >
        Категории
      </Link>
      {level !== 'category' && category && (
        <>
          {' '}
          /{' '}
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault()
              onToModels(category.id)
            }}
          >
            {category.name}
          </Link>
        </>
      )}
      {level === 'instance' && model && (
        <>
          {' '}
          / <span>{model.name}</span>
        </>
      )}
    </nav>
  )
}

