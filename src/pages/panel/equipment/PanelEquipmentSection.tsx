import { useState } from 'react'
import type { PanelKind } from '../../../shared/auth/RequirePanel'
import '../../../css/panel.css'
import '../../../css/panel-equipment.css'
import { TypesBlock } from './TypesBlock'
import { ModelsBlock } from './ModelsBlock'
import { LocationsBlock } from './LocationsBlock'
import { InstancesBlock } from './InstancesBlock'

type SubTab = 'types' | 'models' | 'locations' | 'instances'

export function PanelEquipmentSection({ panel }: { panel: PanelKind }) {
  const canEdit = panel === 'admin' || panel === 'inventory'
  const [tab, setTab] = useState<SubTab>('types')
  const [err, setErr] = useState<string | null>(null)

  return (
    <div>
      <div className="panel-subtabs">
        <button type="button" className={tab === 'types' ? 'is-active' : ''} onClick={() => setTab('types')}>
          Категории (типы)
        </button>
        <button type="button" className={tab === 'models' ? 'is-active' : ''} onClick={() => setTab('models')}>
          Модели
        </button>
        <button type="button" className={tab === 'locations' ? 'is-active' : ''} onClick={() => setTab('locations')}>
          Локации
        </button>
        <button type="button" className={tab === 'instances' ? 'is-active' : ''} onClick={() => setTab('instances')}>
          Экземпляры оборудования
        </button>
      </div>

      {err && <div className="alert alert--error panel-equip__alert">{err}</div>}

      {tab === 'types' && <TypesBlock canEdit={canEdit} onError={setErr} />}
      {tab === 'models' && <ModelsBlock canEdit={canEdit} onError={setErr} />}
      {tab === 'locations' && <LocationsBlock canEdit={canEdit} onError={setErr} />}
      {tab === 'instances' && <InstancesBlock canEdit={canEdit} onError={setErr} panel={panel} />}
    </div>
  )
}
