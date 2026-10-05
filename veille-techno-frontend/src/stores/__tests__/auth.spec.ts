import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/api/auth'
import { ApiError, request, setAuthToken } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/api/auth', () => ({
  authApi: { login: vi.fn<typeof authApi.login>(), register: vi.fn<typeof authApi.register>() },
}))

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    setAuthToken(null)
    vi.unstubAllGlobals()
  })

  it('restores the saved session', () => {
    localStorage.setItem('authToken', 'saved-jwt')

    expect(useAuthStore().token).toBe('saved-jwt')
  })

  it('saves the login token and uses it for protected requests', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'jwt' })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const auth = useAuthStore()

    await auth.login({ email: 'alice@example.com', password: 'secret' })
    await request('GET', '/lists')

    expect(auth.token).toBe('jwt')
    expect(localStorage.getItem('authToken')).toBe('jwt')
    expect(fetchMock.mock.calls[0]![1]?.headers).toEqual({ Authorization: 'Bearer jwt' })
  })

  it('logs in automatically after creating the account', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'new-jwt' })
    const auth = useAuthStore()
    const input = { name: 'Alice', email: 'alice@example.com', password: 'secret' }

    await auth.register(input)

    expect(authApi.register).toHaveBeenCalledWith(input)
    expect(authApi.login).toHaveBeenCalledWith({ email: input.email, password: input.password })
    expect(localStorage.getItem('authToken')).toBe('new-jwt')
  })

  it('keeps a rejected registration visible without trying to log in', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new ApiError(409, ['Email already in use']))
    const auth = useAuthStore()

    await expect(
      auth.register({ name: 'Alice', email: 'alice@example.com', password: 'secret' }),
    ).rejects.toMatchObject({ status: 409 })

    expect(authApi.login).not.toHaveBeenCalled()
    expect(auth.token).toBeNull()
    expect(localStorage.getItem('authToken')).toBeNull()
  })

  it('does not save a session when credentials are rejected', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, ['Invalid credentials']))
    const auth = useAuthStore()

    await expect(
      auth.login({ email: 'alice@example.com', password: 'wrong-password' }),
    ).rejects.toMatchObject({ status: 401 })

    expect(auth.token).toBeNull()
    expect(localStorage.getItem('authToken')).toBeNull()
  })

  it('removes the saved token and bearer header on logout', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ accessToken: 'jwt' })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const auth = useAuthStore()
    await auth.login({ email: 'alice@example.com', password: 'secret' })

    auth.logout()
    await request('GET', '/lists')

    expect(auth.token).toBeNull()
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(fetchMock.mock.calls[0]![1]?.headers).toEqual({})
  })
})
