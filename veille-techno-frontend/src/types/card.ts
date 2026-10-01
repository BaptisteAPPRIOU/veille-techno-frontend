/** A task of the board, stored as a card by the back end. */
export interface Card {
  id: string
  title: string
  /** null until a description is written. */
  description: string | null
  position: number
  listId: string
  /** ISO 8601 dates, as serialized by the API. */
  createdAt: string
  updatedAt: string
}

/** Body of `POST /api/lists/{listId}/cards`. */
export interface CreateCardInput {
  title: string
  /** null empties the description: it is the only field the API accepts as null. */
  description?: string | null
  position?: number
}

/** Body of `PATCH /api/cards/{id}`: a new `listId` moves the card to another list. */
export interface UpdateCardInput extends Partial<CreateCardInput> {
  listId?: string
}
