import { EquipmentInstancePickerModal } from '../../../shared/components/EquipmentInstancePickerModal'
import { ConsumableModelPickerModal } from '../../../shared/components/ConsumableModelPickerModal'

export function WriteOffsPickerModals({
  instancePickerOpen,
  modelPickerOpen,
  pending,
  onCloseInstance,
  onPickInstance,
  onCloseModel,
  onPickModel,
}: {
  instancePickerOpen: boolean
  modelPickerOpen: boolean
  pending: boolean
  onCloseInstance: () => void
  onPickInstance: (id: number, displayName?: string) => void
  onCloseModel: () => void
  onPickModel: (id: number, nm: string) => void
}) {
  return (
    <>
      {instancePickerOpen && (
        <EquipmentInstancePickerModal
          onClose={onCloseInstance}
          onPick={onPickInstance}
          disabled={pending}
          forWriteoff
        />
      )}
      {modelPickerOpen && <ConsumableModelPickerModal onClose={onCloseModel} onPick={onPickModel} disabled={pending} />}
    </>
  )
}
