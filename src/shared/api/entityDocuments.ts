import { apiAxios, unwrapEnvelopeData } from './axiosInstance'
import type { RequestDocumentAttachRequest } from './generated/data-contracts'
import type { PlatformDocument } from './documents'

export type EntityDocument = PlatformDocument & {
  instance_id?: number | null
}

export type DocumentAttachBody = RequestDocumentAttachRequest

async function listDocs(path: string, publicOnly?: boolean) {
  const res = await apiAxios.get(path, { params: publicOnly ? { public: '1' } : undefined })
  return unwrapEnvelopeData<EntityDocument[]>(res)
}

async function attachDoc(path: string, body: DocumentAttachBody) {
  const res = await apiAxios.post(path, body)
  return unwrapEnvelopeData<EntityDocument>(res)
}

async function detachDoc(path: string) {
  const res = await apiAxios.delete(path)
  return unwrapEnvelopeData<unknown>(res)
}

export const modelDocumentsApi = {
  list: (modelId: number, publicOnly?: boolean) => listDocs(`/api/models/${modelId}/docs`, publicOnly),
  attach: (modelId: number, body: DocumentAttachBody) => attachDoc(`/api/models/${modelId}/docs`, body),
  detach: (modelId: number, docId: number) => detachDoc(`/api/models/${modelId}/docs/${docId}`),
}

export const instanceDocumentsApi = {
  list: (instanceId: number, publicOnly?: boolean) => listDocs(`/api/equipment/${instanceId}/docs`, publicOnly),
  attach: (instanceId: number, body: DocumentAttachBody) => attachDoc(`/api/equipment/${instanceId}/docs`, body),
  detach: (instanceId: number, docId: number) => detachDoc(`/api/equipment/${instanceId}/docs/${docId}`),
}

export const ticketDocumentsApi = {
  list: (ticketId: number, publicOnly?: boolean) => listDocs(`/api/tickets/${ticketId}/docs`, publicOnly),
  attach: (ticketId: number, body: DocumentAttachBody) => attachDoc(`/api/tickets/${ticketId}/docs`, body),
  detach: (ticketId: number, docId: number) => detachDoc(`/api/tickets/${ticketId}/docs/${docId}`),
}

export async function linkablePlatformDocuments() {
  const res = await apiAxios.get('/api/docs/linkable')
  return unwrapEnvelopeData<EntityDocument[]>(res)
}
