import type { CreateListInput, List, UpdateListInput } from '@/types/list'
import { request } from './http'

// Bodies are rebuilt field by field: the API rejects any field outside its DTO with a 400, so a
// whole List passed by mistake must not leak its id or createdAt into the request.
export const listsApi = {
  fetchAll: () => request<List[]>('GET', '/lists'),

  create: ({ title, position }: CreateListInput) =>
    request<List>('POST', '/lists', { title, position }),

  update: (id: string, { title, position }: UpdateListInput) =>
    request<List>('PATCH', `/lists/${id}`, { title, position }),

  remove: (id: string) => request<void>('DELETE', `/lists/${id}`),
}
