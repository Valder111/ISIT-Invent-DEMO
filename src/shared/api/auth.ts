import { generatedApi, generatedRequest } from './generatedClient'
import type { RequestUserAuthRequest, RequestUserMePatchRequest } from './generated/data-contracts'

export type UserRole = 'user' | 'laborant' | 'inventory_manager' | 'admin'

export type LoginRequest = RequestUserAuthRequest

export type MeResponse = {
  id: number
  username: string
  email: string
  role: UserRole
  img?: string
  img_url?: string
  is_active?: boolean
  comment?: string
  created_at?: string
  updated_at?: string
}

export const authApi = {
  login(body: LoginRequest) {
    return generatedRequest<unknown>(() => generatedApi.users.usersAuthCreate(body))
  },
  logout() {
    return generatedRequest<unknown>(() => generatedApi.users.usersLogoutCreate())
  },
  me() {
    return generatedRequest<MeResponse>(() => generatedApi.users.usersMeList())
  },
  patchMe(body: RequestUserMePatchRequest) {
    return generatedRequest<MeResponse>(() => generatedApi.users.usersMePartialUpdate(body))
  },
}
