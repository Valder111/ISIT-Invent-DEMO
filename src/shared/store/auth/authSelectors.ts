import type { RootState } from '../index'

export const selectMe = (state: RootState) => state.auth.me

export const selectAuthStatus = (state: RootState) => state.auth.status

/** Пока идёт первичная проверка сессии или запрос auth-thunk. */
export const selectAuthLoading = (state: RootState) => {
  const { status } = state.auth
  return status === 'idle' || status === 'loading'
}
