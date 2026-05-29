import { Navigate, useLocation } from 'react-router-dom'
import { selectAuthLoading, selectMe } from '../store/auth/authSelectors'
import { useAppSelector } from '../store/hooks'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const me = useAppSelector(selectMe)
  const loading = useAppSelector(selectAuthLoading)

  if (loading) return null
  if (!me) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
