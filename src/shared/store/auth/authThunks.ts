import { createAsyncThunk } from '@reduxjs/toolkit'
import type { LoginRequest, MeResponse } from '../../api/auth'
import { generatedApi, generatedRequest } from '../../api/generatedClient'
import { ApiError } from '../../api/http'
import { isDemoBuild } from '../../lib/demoEnv'
import type { RequestUserMePatchRequest } from '../../api/generated/data-contracts'
import {
  currentMe,
  loginByCredentials,
  logout as demoLogout,
  patchMe as demoPatchMe,
} from '../../../mocks/mockDb'

let inflightMe: Promise<MeResponse | null> | null = null

async function loadMe(): Promise<MeResponse | null> {
  if (isDemoBuild()) {
    return currentMe()
  }

  if (inflightMe) return inflightMe

  inflightMe = (async () => {
    try {
      return await generatedRequest<MeResponse>(() => generatedApi.users.usersMeList())
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        return null
      }
      return null
    } finally {
      inflightMe = null
    }
  })()

  return inflightMe
}

export const fetchMe = createAsyncThunk('auth/fetchMe', loadMe)

export const login = createAsyncThunk('auth/login', async (body: LoginRequest) => {
  if (isDemoBuild()) {
    const res = loginByCredentials(body.login, body.password)
    if (!res.ok) {
      throw new ApiError('Неверный логин или пароль', { status: 401, code: 'INVALID_CREDENTIALS' })
    }
    return res.me
  }

  await generatedRequest(() => generatedApi.users.usersAuthCreate(body))
  const me = await loadMe()
  if (!me) {
    throw new ApiError('Не удалось войти: сервер не вернул профиль.', {
      code: 'ME_AFTER_LOGIN',
      status: 401,
    })
  }
  return me
})

export const logout = createAsyncThunk('auth/logout', async () => {
  if (isDemoBuild()) {
    demoLogout()
    return
  }
  await generatedRequest(() => generatedApi.users.usersLogoutCreate())
})

export const patchMe = createAsyncThunk('auth/patchMe', async (body: RequestUserMePatchRequest) => {
  if (isDemoBuild()) {
    const profile = demoPatchMe(body)
    if (!profile) throw new ApiError('Пользователь не найден', { status: 404 })
    return profile
  }
  return generatedRequest<MeResponse>(() => generatedApi.users.usersMePartialUpdate(body))
})
