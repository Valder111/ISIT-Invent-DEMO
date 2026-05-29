import { generatedApi, generatedRequest } from './generatedClient'
import type {
  RequestDocumentAccessUpdateRequest,
  RequestDocumentAttachRequest,
} from './generated/data-contracts'

export type PlatformDocument = {
  id: number
  ticket_id?: number | null
  model_id?: number | null
  instance_id?: number | null
  object_key: string
  filename: string
  content_type: string
  size: number
  is_public: boolean
  uploaded_by_id?: number | null
  comment: string
  created_at: string
  url?: string
  uploaded_by?: { id?: number; username?: string; email?: string } | null
}

export type DocumentAttachBody = RequestDocumentAttachRequest

export type DocumentAccessBody = RequestDocumentAccessUpdateRequest

export const documentsApi = {
  list() {
    return generatedRequest<PlatformDocument[]>(() => generatedApi.documents.docsList())
  },
  attach(body: DocumentAttachBody) {
    return generatedRequest<PlatformDocument>(() => generatedApi.documents.docsCreate(body))
  },
  updateAccess(docId: number, body: DocumentAccessBody) {
    return generatedRequest<PlatformDocument>(() => generatedApi.documents.docsPartialUpdate({ docId }, body))
  },
  delete(docId: number) {
    return generatedRequest<unknown>(() => generatedApi.documents.docsDelete({ docId }))
  },
}
