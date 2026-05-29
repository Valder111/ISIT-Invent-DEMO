import { generatedApi, generatedRequest, generatedRequestWithMeta } from './generatedClient'
import type { RequestUserAdminPatchRequest, RequestUserCreateRequest } from './generated/data-contracts'
import type { UserRole } from './auth'

export type UserListItem = {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
  comment?: string
  created_at: string
  updated_at: string
}

export type UserDetail = UserListItem & {
  img?: string
  img_url?: string
  comment?: string
}

export type UserCreateBody = RequestUserCreateRequest & { role: UserRole }

export type UserAdminPatchBody = RequestUserAdminPatchRequest & {
  role?: UserRole
}

export const usersApi = {
  list() {
    return generatedRequest<UserListItem[]>(() => generatedApi.users.usersList())
  },
  listWithMeta() {
    return generatedRequestWithMeta<UserListItem[]>(() => generatedApi.users.usersList())
  },
  get(id: number) {
    return generatedRequest<UserDetail>(() => generatedApi.users.usersDetail({ id }))
  },
  create(body: UserCreateBody) {
    return generatedRequest<UserDetail>(() => generatedApi.users.usersCreate(body))
  },
  patch(id: number, body: UserAdminPatchBody) {
    return generatedRequest<UserDetail>(() => generatedApi.users.usersPartialUpdate({ id }, body))
  },
}
