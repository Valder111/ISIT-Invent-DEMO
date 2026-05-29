import { cachedListFetchViaMeta } from './cache/fetch'
import { cacheKeys, queryKey } from './cache/keys'
import { publishCacheStatus } from './cache/status'
import {
  invalidateAllEquipmentDomain,
  invalidateCatalog,
  invalidateEquipment,
  invalidateLocations,
  invalidateModels,
  invalidateTypes,
} from './cache/store'
import { apiAxios } from './axiosInstance'
import { generatedApi, generatedRequest, generatedRequestWithMeta } from './generatedClient'
import type { ResponseResponse } from './generated/data-contracts'
import type {
  EquipmentListParams,
  ModelsListParams,
  RequestEquipmentCreateRequest,
  RequestEquipmentUpdateRequest,
  RequestLocationCreateRequest,
  RequestLocationUpdateRequest,
  RequestModelCreateRequest,
  RequestModelUpdateRequest,
  RequestTypeCreateRequest,
  RequestTypeUpdateRequest,
} from './generated/data-contracts'
import type { CachedFetchResult } from './cache/types'

export type EquipmentCategory = {
  id: number
  name: string
  description: string
  img: string
  img_url?: string
  comment: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EquipmentModel = {
  id: number
  type_id: number
  name: string
  description: string
  is_consumable: boolean
  count: number
  img: string
  img_url?: string
  comment: string
  is_active: boolean
  created_at: string
  updated_at: string
  type?: EquipmentCategory
}

export type Location = {
  id: number
  name: string
  description?: string
  comment?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export type EquipmentInstance = {
  id: number
  model_id: number
  location_id?: number | null
  name: string
  description: string
  invent_number: number
  /** Заводской номер (пустая строка, если не пропарсился / не указан) */
  factory_number?: string
  status: string
  qr_token: string
  qr_img?: string
  qr_img_url?: string
  img: string
  img_url?: string
  comment: string
  is_active: boolean
  created_at: string
  updated_at: string
  model?: EquipmentModel
  location?: Location | null
}

export type TypeCreateBody = RequestTypeCreateRequest
export type TypeUpdateBody = {
  name?: string
  description?: string | null
  img?: string | null
  comment?: string | null
  is_active?: boolean | null
}
export type ModelCreateBody = RequestModelCreateRequest
export type ModelUpdateBody = {
  type_id?: number
  name?: string
  description?: string | null
  is_consumable?: boolean | null
  count?: number | null
  img?: string | null
  comment?: string | null
  is_active?: boolean | null
}
export type LocationCreateBody = RequestLocationCreateRequest
export type LocationUpdateBody = {
  name?: string
  description?: string | null
  comment?: string | null
  is_active?: boolean | null
}
export type EquipmentCreateBody = Omit<RequestEquipmentCreateRequest, 'status'> & {
  status?: string
  factory_number?: string
}
export type EquipmentUpdateBody = {
  location_id?: number | null
  factory_number?: string | null
  status?: string
  name?: string
  description?: string | null
  img?: string
  comment?: string
  is_active?: boolean | null
}

function trackList<T>(resource: string, r: CachedFetchResult<T>): T {
  publishCacheStatus({
    resource,
    clientSource: r.source,
    serverCache: r.serverCache ?? r.meta?.cache,
    at: Date.now(),
  })
  return r.data
}

function toModelsQuery(opts?: { type_id?: number; consumable?: boolean }): ModelsListParams {
  return { type_id: opts?.type_id, consumable: opts?.consumable }
}

function toEquipmentQuery(opts?: {
  status?: string
  category?: string
  location_id?: number
  search?: string
  include_inactive?: boolean
}): EquipmentListParams {
  return {
    status: opts?.status,
    category: opts?.category,
    location_id: opts?.location_id,
    search: opts?.search,
    include_inactive: opts?.include_inactive,
  }
}

export const typesApi = {
  async list() {
    const r = await cachedListFetchViaMeta<EquipmentCategory[]>(cacheKeys.typesList(), () =>
      generatedRequestWithMeta(() => generatedApi.types.typesList()),
    )
    return trackList('types', r)
  },
  listCached(): Promise<CachedFetchResult<EquipmentCategory[]>> {
    return cachedListFetchViaMeta(cacheKeys.typesList(), () =>
      generatedRequestWithMeta(() => generatedApi.types.typesList()),
    )
  },
  get(id: number) {
    return generatedRequest<EquipmentCategory>(() => generatedApi.types.typesDetail({ id }))
  },
  async create(body: TypeCreateBody) {
    const item = await generatedRequest<EquipmentCategory>(() => generatedApi.types.typesCreate(body))
    invalidateCatalog()
    return item
  },
  async update(id: number, body: TypeUpdateBody) {
    const item = await generatedRequest<EquipmentCategory>(() =>
      generatedApi.types.typesUpdate({ id }, body as RequestTypeUpdateRequest),
    )
    invalidateCatalog()
    return item
  },
  async delete(id: number) {
    const res = await generatedRequest<{ message?: string; id?: number }>(() => generatedApi.types.typesDelete({ id }))
    invalidateCatalog()
    return res
  },
}

export const modelsApi = {
  async list(opts?: { type_id?: number; consumable?: boolean }) {
    const q = queryKey({ type_id: opts?.type_id, consumable: opts?.consumable })
    const r = await cachedListFetchViaMeta<EquipmentModel[]>(cacheKeys.modelsList(q), () =>
      generatedRequestWithMeta(() => generatedApi.models.modelsList(toModelsQuery(opts))),
    )
    return trackList('models', r)
  },
  async listWithMeta(opts?: { type_id?: number; consumable?: boolean }) {
    const q = queryKey({ type_id: opts?.type_id, consumable: opts?.consumable })
    const r = await cachedListFetchViaMeta<EquipmentModel[]>(cacheKeys.modelsList(q), () =>
      generatedRequestWithMeta(() => generatedApi.models.modelsList(toModelsQuery(opts))),
    )
    publishCacheStatus({
      resource: 'models',
      clientSource: r.source,
      serverCache: r.serverCache ?? r.meta?.cache,
      at: Date.now(),
    })
    return { data: r.data, meta: r.meta }
  },
  get(id: number) {
    return generatedRequest<EquipmentModel>(() => generatedApi.models.modelsDetail({ id }))
  },
  async create(body: ModelCreateBody) {
    const item = await generatedRequest<EquipmentModel>(() => generatedApi.models.modelsCreate(body))
    invalidateModels()
    invalidateEquipment()
    return item
  },
  async update(id: number, body: ModelUpdateBody) {
    const item = await generatedRequest<EquipmentModel>(() =>
      generatedApi.models.modelsUpdate({ id }, body as RequestModelUpdateRequest),
    )
    invalidateModels()
    invalidateEquipment()
    return item
  },
  async delete(id: number) {
    const res = await generatedRequest<{ message?: string; id?: number }>(() => generatedApi.models.modelsDelete({ id }))
    invalidateModels()
    invalidateEquipment()
    return res
  },
}

export const locationsApi = {
  async list() {
    const r = await cachedListFetchViaMeta<Location[]>(cacheKeys.locationsList(), () =>
      generatedRequestWithMeta(() => generatedApi.locations.locationsList()),
    )
    return trackList('locations', r)
  },
  get(id: number) {
    return generatedRequest<Location>(() => generatedApi.locations.locationsDetail({ id }))
  },
  async create(body: LocationCreateBody) {
    const item = await generatedRequest<Location>(() => generatedApi.locations.locationsCreate(body))
    invalidateLocations()
    invalidateEquipment()
    return item
  },
  async update(id: number, body: LocationUpdateBody) {
    const item = await generatedRequest<Location>(() =>
      generatedApi.locations.locationsUpdate({ id }, body as RequestLocationUpdateRequest),
    )
    invalidateLocations()
    invalidateEquipment()
    return item
  },
  async delete(id: number) {
    const res = await generatedRequest<{ message?: string; id?: number }>(() =>
      generatedApi.locations.locationsDelete({ id }),
    )
    invalidateLocations()
    invalidateEquipment()
    return res
  },
}

export const instancesApi = {
  async list(opts?: { status?: string; category?: string; location_id?: number; search?: string; include_inactive?: boolean }) {
    const q = queryKey(opts ?? {})
    const r = await cachedListFetchViaMeta<EquipmentInstance[]>(cacheKeys.equipmentList(q), () =>
      generatedRequestWithMeta(() => generatedApi.equipment.equipmentList(toEquipmentQuery(opts))),
    )
    return trackList('equipment', r)
  },
  async listWithMeta(opts?: { status?: string; category?: string; location_id?: number; search?: string; include_inactive?: boolean }) {
    const q = queryKey(opts ?? {})
    const r = await cachedListFetchViaMeta<EquipmentInstance[]>(cacheKeys.equipmentList(q), () =>
      generatedRequestWithMeta(() => generatedApi.equipment.equipmentList(toEquipmentQuery(opts))),
    )
    publishCacheStatus({
      resource: 'equipment',
      clientSource: r.source,
      serverCache: r.serverCache ?? r.meta?.cache,
      at: Date.now(),
    })
    return { data: r.data, meta: r.meta }
  },
  get(id: number) {
    return generatedRequest<EquipmentInstance>(() => generatedApi.equipment.equipmentDetail({ id }))
  },
  getByQrToken(qrToken: string) {
    const token = encodeURIComponent(qrToken.trim())
    return generatedRequest<EquipmentInstance>(() => apiAxios.get<ResponseResponse>(`/api/equipment/qr/${token}`))
  },
  async create(body: EquipmentCreateBody) {
    const item = await generatedRequest<EquipmentInstance>(() =>
      generatedApi.equipment.equipmentCreate(body as RequestEquipmentCreateRequest),
    )
    invalidateEquipment()
    return item
  },
  async update(id: number, body: EquipmentUpdateBody) {
    const item = await generatedRequest<EquipmentInstance>(() =>
      generatedApi.equipment.equipmentUpdate({ id }, body as RequestEquipmentUpdateRequest),
    )
    invalidateEquipment()
    return item
  },
  async delete(id: number) {
    const res = await generatedRequest<{ message?: string; id?: number }>(() =>
      generatedApi.equipment.equipmentDelete({ id }),
    )
    invalidateEquipment()
    return res
  },
}

export { invalidateAllEquipmentDomain, invalidateCatalog, invalidateEquipment, invalidateTypes }
