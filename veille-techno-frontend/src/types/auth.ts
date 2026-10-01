/** Body of `POST /api/auth/login`. */
export interface LoginInput {
  email: string
  password: string
}

/** Body of `POST /api/auth/register`. */
export interface RegisterInput extends LoginInput {
  name: string
}

/** Answer of `POST /api/auth/login`: the JWT to send with every other call. */
export interface AuthToken {
  accessToken: string
}

/** A user as returned by the API, which never sends the password. */
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  /** ISO 8601 date, as serialized by the API. */
  createdAt: string
}
