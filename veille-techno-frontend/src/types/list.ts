/** A board column, stored as a list by the back end. */
export interface List {
  id: string
  title: string
  position: number
  ownerId: string
  /** ISO 8601 date, as serialized by the API. */
  createdAt: string
}

/** Body of `POST /api/lists`. */
export interface CreateListInput {
  title: string
  position?: number
}

/** Body of `PATCH /api/lists/{id}`. */
export type UpdateListInput = Partial<CreateListInput>
