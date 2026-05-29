import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from '../api/auth'
import { selectAuthLoading, selectMe } from '../store/auth/authSelectors'
import { useAppSelector } from '../store/hooks'

function hasRole(userRole: UserRole, allowed: UserRole[]) {
  return allowed.includes(userRole)
}

export function RequireRole({
  allowed,
  children,
}: {
  allowed: UserRole[]
  children: React.ReactNode
}) {
  const location = useLocation()
  const me = useAppSelector(selectMe)
  const loading = useAppSelector(selectAuthLoading)

  if (loading) return null
  if (!me) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  if (!hasRole(me.role, allowed)) return <Navigate to="/" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
