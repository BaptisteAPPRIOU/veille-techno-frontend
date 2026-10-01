import type { Card, CreateCardInput, UpdateCardInput } from '@/types/card'
import { request } from './http'

// Bodies are rebuilt field by field: the API rejects any field outside its DTO with a 400, so a
// whole Card passed by mistake must not leak its id or createdAt into the request.
export const cardsApi = {
  fetchByList: (listId: string) => request<Card[]>('GET', `/lists/${listId}/cards`),

  create: (listId: string, { title, description, position }: CreateCardInput) =>
    request<Card>('POST', `/lists/${listId}/cards`, { title, description, position }),

  update: (id: string, { title, description, position, listId }: UpdateCardInput) =>
    request<Card>('PATCH', `/cards/${id}`, { title, description, position, listId }),

  remove: (id: string) => request<void>('DELETE', `/cards/${id}`),
}
