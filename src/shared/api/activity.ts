import { generatedApi, generatedRequest, generatedRequestWithMeta } from './generatedClient'
import type { ActivityListParams } from './generated/data-contracts'

export type ActivityLog = {
  id: number
  user_id?: number | null
  entity_type: string
  entity_id?: number | null
  activity: string
  type: string
  comment: string
  created_at: string
  user?: { id?: number; username?: string; email?: string } | null
}

function toQuery(opts?: { limit?: number; offset?: number; type?: string }): ActivityListParams {
  return {
    limit: opts?.limit,
    offset: opts?.offset,
    type: opts?.type,
  }
}

export const activityApi = {
  list(opts?: { limit?: number; offset?: number; type?: string }) {
    return generatedRequest<ActivityLog[]>(() => generatedApi.activity.activityList(toQuery(opts)))
  },
  listWithMeta(opts?: { limit?: number; offset?: number; type?: string }) {
    return generatedRequestWithMeta<ActivityLog[]>(() => generatedApi.activity.activityList(toQuery(opts)))
  },
}
