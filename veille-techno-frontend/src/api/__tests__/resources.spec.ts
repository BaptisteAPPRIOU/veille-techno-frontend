import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authApi } from '@/api/auth'
import { cardsApi } from '@/api/cards'
import { request } from '@/api/http'
import { listsApi } from '@/api/lists'
import type { Card } from '@/types/card'

vi.mock('@/api/http', () => ({ request: vi.fn<typeof request>() }))

describe('API modules', () => {
  beforeEach(() => {
    vi.mocked(request).mockReset()
  })

  it('maps the auth routes', async () => {
    await authApi.register({ email: 'alice@example.com', password: 'secret', name: 'Alice' })
    await authApi.login({ email: 'alice@example.com', password: 'secret' })

    expect(request).toHaveBeenNthCalledWith(1, 'POST', '/auth/register', {
      email: 'alice@example.com',
      password: 'secret',
      name: 'Alice',
    })
    expect(request).toHaveBeenNthCalledWith(2, 'POST', '/auth/login', {
      email: 'alice@example.com',
      password: 'secret',
    })
  })

  it('maps the lists routes', async () => {
    await listsApi.fetchAll()
    await listsApi.create({ title: 'To do', position: 0 })
    await listsApi.update('l1', { title: 'Doing' })
    await listsApi.remove('l1')

    expect(vi.mocked(request).mock.calls).toEqual([
      ['GET', '/lists'],
      ['POST', '/lists', { title: 'To do', position: 0 }],
      ['PATCH', '/lists/l1', { title: 'Doing' }],
      ['DELETE', '/lists/l1'],
    ])
  })

  it('maps the cards routes', async () => {
    await cardsApi.fetchByList('l1')
    await cardsApi.create('l1', { title: 'Write the README' })
    await cardsApi.remove('c1')

    expect(vi.mocked(request).mock.calls).toEqual([
      ['GET', '/lists/l1/cards'],
      ['POST', '/lists/l1/cards', { title: 'Write the README' }],
      ['DELETE', '/cards/c1'],
    ])
  })

  it('sends only the DTO fields when a whole card is passed to update', async () => {
    const card: Card = {
      id: 'c1',
      title: 'Write the README',
      description: null,
      position: 2,
      listId: 'l1',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    }

    await cardsApi.update(card.id, { ...card, title: 'Write the detailed README' })

    expect(request).toHaveBeenCalledWith('PATCH', '/cards/c1', {
      title: 'Write the detailed README',
      description: null,
      position: 2,
      listId: 'l1',
    })
  })
})
