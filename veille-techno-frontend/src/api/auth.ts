import type { AuthToken, LoginInput, RegisterInput, User } from '@/types/auth'
import { request } from './http'

export const authApi = {
  // Only creates the account: the API answers with the user and no token, so log in afterwards.
  register: ({ email, password, name }: RegisterInput) =>
    request<User>('POST', '/auth/register', { email, password, name }),

  login: ({ email, password }: LoginInput) =>
    request<AuthToken>('POST', '/auth/login', { email, password }),
}
