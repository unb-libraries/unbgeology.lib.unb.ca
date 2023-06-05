import type { H3Event, EventHandler } from "h3"
import { type User } from "~~/types/user"

export function requireAuthentication<T>(handler: EventHandler<T>): EventHandler<T> {
  return async (event) => {
    const { data } = await useCurrentServerSession(event)
    if (!data.user) {
      throw createError({ statusCode: 403, message: `Unauthorized` })
    }
    return handler(event)
  }
}

export function useCurrentUser(event: H3Event): User {
  return event.context.user
}
