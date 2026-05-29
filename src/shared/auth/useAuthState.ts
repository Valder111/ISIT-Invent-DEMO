import { useCallback } from 'react'
import type { MeResponse } from '../api/auth'
import { fetchMe, logout as logoutThunk } from '../store/auth/authThunks'
import { selectAuthLoading, selectMe } from '../store/auth/authSelectors'
import { useAppDispatch, useAppSelector } from '../store/hooks'

type AuthState = {
  me: MeResponse | null
  loading: boolean
  refreshMe: () => Promise<MeResponse | null>
  logout: () => Promise<void>
}

/** Сессия пользователя из Redux (auth slice). */
export function useAuthState(): AuthState {
  const dispatch = useAppDispatch()
  const me = useAppSelector(selectMe)
  const loading = useAppSelector(selectAuthLoading)

  const refreshMe = useCallback(async () => {
    const result = await dispatch(fetchMe())
    if (fetchMe.fulfilled.match(result)) return result.payload
    return null
  }, [dispatch])

  const logout = useCallback(async () => {
    await dispatch(logoutThunk())
  }, [dispatch])

  return { me, loading, refreshMe, logout }
}
