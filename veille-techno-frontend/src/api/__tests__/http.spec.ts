import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, request, setAuthToken, UNREACHABLE_MESSAGE } from '@/api/http'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('request', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    setAuthToken(null)
  })

  it('sends a JSON body to /api and returns the parsed answer', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: 'l1', title: 'To do' }))

    const list = await request('POST', '/lists', { title: 'To do' })

    expect(list).toEqual({ id: 'l1', title: 'To do' })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/lists')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"title":"To do"}')
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('adds the bearer token once one is set', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, []))
    setAuthToken('jwt')

    await request('GET', '/lists')

    expect(fetchMock.mock.calls[0]![1]?.headers).toEqual({ Authorization: 'Bearer jwt' })
  })

  it('resolves without a value on a 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(request('DELETE', '/lists/l1')).resolves.toBeUndefined()
  })

  it('keeps every validation message of a 400', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        statusCode: 400,
        message: ['email must be an email', 'password should not be empty'],
        error: 'Bad Request',
      }),
    )

    const error = await request('POST', '/auth/login', {}).catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      messages: ['email must be an email', 'password should not be empty'],
    })
  })

  it('wraps a single NestJS message', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { statusCode: 401, message: 'Unauthorized' }))

    await expect(request('GET', '/lists')).rejects.toMatchObject({
      status: 401,
      messages: ['Unauthorized'],
    })
  })

  it('reports the API as unreachable on a 502 from the proxy', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 502 }))

    await expect(request('GET', '/lists')).rejects.toMatchObject({
      status: 502,
      messages: [UNREACHABLE_MESSAGE],
    })
  })

  it('reports the API as unreachable when the request cannot be sent', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(request('GET', '/lists')).rejects.toMatchObject({
      status: 0,
      messages: [UNREACHABLE_MESSAGE],
    })
  })
})
