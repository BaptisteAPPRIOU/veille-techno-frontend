import { describe, it, expect } from 'vitest'

import router from '@/router'

describe('router', () => {
  it('opens the board at the root URL', async () => {
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('board')
  })

  it('serves the login and register pages', async () => {
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('login')

    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('register')
  })

  it('redirects an unknown URL to the board', async () => {
    await router.push('/nimporte-quoi')
    expect(router.currentRoute.value.name).toBe('board')
    expect(router.currentRoute.value.redirectedFrom?.path).toBe('/nimporte-quoi')
  })
})
