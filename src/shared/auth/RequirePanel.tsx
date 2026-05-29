import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from '../api/auth'
import { selectAuthLoading, selectMe } from '../store/auth/authSelectors'
import { useAppSelector } from '../store/hooks'

export type PanelKind = 'admin' | 'inventory' | 'laborant'

const panelRoles: Record<PanelKind, UserRole[]> = {
  admin: ['admin'],
  inventory: ['admin', 'inventory_manager'],
  laborant: ['admin', 'laborant'],
}

export function panelAllowsRole(panel: PanelKind, role: UserRole): boolean {
  return panelRoles[panel].includes(role)
}

export function RequirePanel({ panel, children }: { panel: PanelKind; children: React.ReactNode }) {
  const location = useLocation()
  const me = useAppSelector(selectMe)
  const loading = useAppSelector(selectAuthLoading)

  if (loading) return null
  if (!me) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  if (!panelAllowsRole(panel, me.role)) return <Navigate to="/" replace />

  return <>{children}</>
}
