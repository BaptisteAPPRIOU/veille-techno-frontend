import { beforeEach, describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import router from '@/router'
import { useAuthStore } from '@/stores/auth'

describe('router', () => {
  beforeEach(async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    await router.push('/login')
  })

  it('opens the board when signed in', async () => {
    useAuthStore().token = 'jwt'
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('board')
  })

  it('redirects a visitor to login when opening the board', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('serves the login and register pages', async () => {
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('login')

    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('register')
  })

  it('redirects an unknown URL to the board', async () => {
    useAuthStore().token = 'jwt'
    await router.push('/nimporte-quoi')
    expect(router.currentRoute.value.name).toBe('board')
    expect(router.currentRoute.value.redirectedFrom?.path).toBe('/nimporte-quoi')
  })

  it('keeps the board protected when a visitor opens an unknown URL', async () => {
    await router.push('/nimporte-quoi')
    expect(router.currentRoute.value.name).toBe('login')
  })
})
