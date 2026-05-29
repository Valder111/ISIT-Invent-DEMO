import { generatedApi, generatedRequest } from './generatedClient'
import type {
  RequestTicketCancelReasonRequest,
  RequestTicketCreateRequest,
  RequestTicketItemAddRequest,
  RequestTicketItemUpdateRequest,
  RequestTicketUpdateRequest,
  TicketsListParams,
} from './generated/data-contracts'
import type { EquipmentInstance, EquipmentModel } from './equipment'

export type TicketType = 'repair' | 'network' | 'hardware' | 'software'
export type TicketStatus = 'draft' | 'in_progress' | 'done' | 'cancelled'

export type TicketAuthor = {
  id: number
  username: string
  email: string
}

export type TicketLaborant = {
  id: number
  username: string
}

export type TicketItem = {
  id: number
  ticket_id: number
  model_id: number
  instance_id?: number | null
  quantity: number
  comment: string
  created_at: string
  updated_at: string
  model?: EquipmentModel
  instance?: EquipmentInstance | null
}

export type Ticket = {
  id: number
  author_id: number
  laborant_id?: number | null
  type: TicketType | string
  status: TicketStatus | string
  name: string
  description: string
  comment: string
  cancel_reason?: string
  is_active: boolean
  created_at: string
  updated_at: string
  author?: TicketAuthor
  laborant?: TicketLaborant | null
  items?: TicketItem[]
}

export type TicketCreateBody = RequestTicketCreateRequest & { type: TicketType }

export type TicketUpdateBody = RequestTicketUpdateRequest

export type TicketItemAddBody = RequestTicketItemAddRequest

export type TicketItemUpdateBody = RequestTicketItemUpdateRequest

export type TicketCancelReasonBody = RequestTicketCancelReasonRequest

function toListQuery(opts?: {
  status?: string
  author_id?: number
  laborant_id?: number
  type?: string
  panel?: boolean
}): TicketsListParams {
  return {
    status: opts?.status,
    author_id: opts?.author_id,
    laborant_id: opts?.laborant_id,
    type: opts?.type,
    panel: opts?.panel ? '1' : undefined,
  }
}

export const ticketsApi = {
  list(opts?: { status?: string; author_id?: number; laborant_id?: number; type?: string; panel?: boolean }) {
    return generatedRequest<Ticket[]>(() => generatedApi.tickets.ticketsList(toListQuery(opts)))
  },
  get(id: number) {
    return generatedRequest<Ticket>(() => generatedApi.tickets.ticketsDetail({ id }))
  },
  createDraft(body: TicketCreateBody) {
    return generatedRequest<Ticket>(() => generatedApi.tickets.ticketsCreate(body))
  },
  update(id: number, body: TicketUpdateBody) {
    return generatedRequest<Ticket>(() => generatedApi.tickets.ticketsUpdate({ id }, body))
  },
  delete(id: number) {
    return generatedRequest<{ message?: string; ticket_id?: number }>(() => generatedApi.tickets.ticketsDelete({ id }))
  },
  adminHardDelete(id: number) {
    return generatedRequest<{ message?: string; id?: number }>(() => generatedApi.tickets.ticketsHardDelete({ id }))
  },
  form(id: number) {
    return generatedRequest<Ticket>(() => generatedApi.tickets.ticketsFormUpdate({ id }))
  },
  accept(id: number) {
    return generatedRequest<Ticket>(() => generatedApi.tickets.ticketsAcceptUpdate({ id }))
  },
  complete(id: number) {
    return generatedRequest<{ message?: string; ticket_id?: number }>(() =>
      generatedApi.tickets.ticketsCompleteUpdate({ id }),
    )
  },
  reject(id: number, body: TicketCancelReasonBody) {
    return generatedRequest<{ message?: string }>(() => generatedApi.tickets.ticketsRejectUpdate({ id }, body))
  },
  cancel(id: number, body: TicketCancelReasonBody) {
    return generatedRequest<{ message?: string; ticket_id?: number }>(() =>
      generatedApi.tickets.ticketsCancelUpdate({ id }, body),
    )
  },
  addItem(ticketId: number, body: TicketItemAddBody) {
    return generatedRequest<TicketItem>(() => generatedApi.ticketItems.ticketsItemsCreate({ id: ticketId }, body))
  },
  updateItem(ticketId: number, equipmentId: number, body: TicketItemUpdateBody) {
    return generatedRequest<TicketItem>(() =>
      generatedApi.ticketItems.ticketsItemsUpdate({ id: ticketId, equipmentId }, body),
    )
  },
  deleteItem(ticketId: number, equipmentId: number) {
    return generatedRequest<unknown>(() =>
      generatedApi.ticketItems.ticketsItemsDelete({ id: ticketId, equipmentId }),
    )
  },
  updateItemById(ticketId: number, itemId: number, body: TicketItemUpdateBody) {
    return generatedRequest<TicketItem>(() =>
      generatedApi.ticketItems.ticketsItemsByIdUpdate({ id: ticketId, itemId }, body),
    )
  },
  deleteItemById(ticketId: number, itemId: number) {
    return generatedRequest<unknown>(() =>
      generatedApi.ticketItems.ticketsItemsByIdDelete({ id: ticketId, itemId }),
    )
  },
}
