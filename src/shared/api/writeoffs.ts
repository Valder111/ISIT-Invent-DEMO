import { invalidateEquipment } from './cache/store'
import { generatedApi, generatedRequest, generatedRequestWithMeta } from './generatedClient'
import type { RequestWriteOffCreateRequest, WriteoffsListParams } from './generated/data-contracts'

export type WriteOffCreateBody = RequestWriteOffCreateRequest

export type WriteOff = {
  id: number
  item_id?: number | null
  model_id: number
  authorized_by_id: number
  name: string
  reason: string
  act_number: string
  quantity: number
  comment?: string
  created_at: string
  item?: { id: number; name?: string }
  model?: { id: number; name?: string }
  authorized_by?: { id: number; username?: string }
}

function toListQuery(params?: { limit?: number; offset?: number }): WriteoffsListParams {
  return { limit: params?.limit, offset: params?.offset }
}

export const writeoffsApi = {
  list(params?: { limit?: number; offset?: number }) {
    return generatedRequestWithMeta<WriteOff[]>(() => generatedApi.writeOffs.writeoffsList(toListQuery(params)))
  },

  async create(body: WriteOffCreateBody) {
    const item = await generatedRequest<WriteOff>(() => generatedApi.writeOffs.writeoffsCreate(body))
    invalidateEquipment()
    return item
  },

  get(id: number) {
    return generatedRequest<WriteOff>(() => generatedApi.writeOffs.writeoffsDetail({ id }))
  },
}
