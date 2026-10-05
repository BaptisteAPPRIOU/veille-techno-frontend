import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { setAuthToken } from '@/api/http'
import type { LoginInput, RegisterInput } from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  // localStorage garde le token quand on recharge la page.
  state: () => ({
    token: localStorage.getItem('authToken'),
  }),

  actions: {
    async login(input: LoginInput) {
      const { accessToken } = await authApi.login(input)
      localStorage.setItem('authToken', accessToken)
      this.token = accessToken
      setAuthToken(accessToken)
    },

    async register(input: RegisterInput) {
      await authApi.register(input)
      // L'inscription ne renvoie pas de JWT : on se connecte juste après.
      await this.login({ email: input.email, password: input.password })
    },

    logout() {
      localStorage.removeItem('authToken')
      this.token = null
      setAuthToken(null)
    },
  },
})
