import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchMe } from '../store/auth/authThunks'
import { sessionCheckSkipped } from '../store/auth/authSlice'
import { selectMe } from '../store/auth/authSelectors'
import { useAppDispatch, useAppSelector } from '../store/hooks'

/** Загрузка сессии при смене маршрута (как прежний useAuthState). */
export function AuthSessionSync() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const me = useAppSelector(selectMe)

  useEffect(() => {
    const onAuthRoute = location.pathname === '/auth' || location.pathname.startsWith('/auth/')

    if (onAuthRoute) {
      dispatch(sessionCheckSkipped())
      return
    }

    // После login/me уже в store — не дергаем /me снова (иначе гонка и сброс сессии).
    if (me) return

    void dispatch(fetchMe())
  }, [location.pathname, dispatch, me])

  return null
}
