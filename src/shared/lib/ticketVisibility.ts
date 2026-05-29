import type { MeResponse } from '../api/auth'
import type { Ticket } from '../api/tickets'

/** Согласовано с серверной проверкой TicketGet. */
export function canViewTicket(ticket: Ticket, me: MeResponse | null): boolean {
  if (!me) return false
  if (me.role === 'admin' || me.role === 'inventory_manager') return true
  if (ticket.author_id === me.id) return true
  if (me.role === 'laborant') {
    if (ticket.laborant_id != null && ticket.laborant_id === me.id) return true
    if (String(ticket.status) === 'in_progress' && ticket.laborant_id == null) return true
    return false
  }
  return me.role === 'user' && ticket.author_id === me.id
}

export function filterTicketsForViewer(list: Ticket[], me: MeResponse | null): Ticket[] {
  if (!me) return []
  return list.filter((t) => canViewTicket(t, me))
}
