import type { AxiosResponse } from 'axios'
import { apiAxios, unwrapEnvelopeData, unwrapEnvelopeWithMeta } from './axiosInstance'
import { Activity } from './generated/Activity'
import { Documents } from './generated/Documents'
import { Equipment } from './generated/Equipment'
import { Files } from './generated/Files'
import { Locations } from './generated/Locations'
import { Models } from './generated/Models'
import { Reports } from './generated/Reports'
import { System } from './generated/System'
import { TicketItems } from './generated/TicketItems'
import { Tickets } from './generated/Tickets'
import { Types } from './generated/Types'
import { Users } from './generated/Users'
import { WriteOffs } from './generated/WriteOffs'
import type { HttpClient } from './generated/http-client'
import type { ResponseResponse } from './generated/data-contracts'

const sharedAxios = apiAxios

function bindGeneratedApi<T extends HttpClient>(Ctor: new () => T): T {
  const api = new Ctor()
  api.instance = sharedAxios
  return api
}

/** Сгенерированные axios-клиенты по тегам Swagger (один shared instance). */
export const generatedApi = {
  activity: bindGeneratedApi(Activity),
  documents: bindGeneratedApi(Documents),
  equipment: bindGeneratedApi(Equipment),
  files: bindGeneratedApi(Files),
  locations: bindGeneratedApi(Locations),
  models: bindGeneratedApi(Models),
  reports: bindGeneratedApi(Reports),
  system: bindGeneratedApi(System),
  ticketItems: bindGeneratedApi(TicketItems),
  tickets: bindGeneratedApi(Tickets),
  types: bindGeneratedApi(Types),
  users: bindGeneratedApi(Users),
  writeOffs: bindGeneratedApi(WriteOffs),
} as const

/** Вызов сгенерированного метода → `data` из `{ success, data, error }`. */
export async function generatedRequest<T>(
  call: () => Promise<AxiosResponse<ResponseResponse>>,
): Promise<T> {
  return unwrapEnvelopeData<T>(await call())
}

/** То же + `meta` и заголовок X-Cache (как apiFetchWithMeta). */
export async function generatedRequestWithMeta<T>(
  call: () => Promise<AxiosResponse<ResponseResponse>>,
) {
  return unwrapEnvelopeWithMeta<T>(await call())
}

export * from './generated/data-contracts'
