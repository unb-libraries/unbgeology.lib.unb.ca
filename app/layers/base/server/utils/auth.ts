import type { H3Event, EventHandler, EventHandlerRequest } from "h3"
import { type User } from "@unb-libraries/nuxt-layer-entity"

export function requireAuthentication<T extends EventHandlerRequest = EventHandlerRequest>(handler: EventHandler<T>): EventHandler<T> {
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

export function $fetchWithSession<T = any>(event: H3Event): (...params: Parameters<typeof $fetch<T>>) => ReturnType<typeof $fetch<T>> {
  return (...params: Parameters<typeof $fetch<T>>) => {
    const sessionName = useRuntimeConfig().public.session.name
    const cookie = `${sessionName}=${getCookie(event, sessionName)}`
    params[1] ||= {}
    params[1].headers = { ...params[1].headers, Cookie: cookie }
    return $fetch<T>(...params)
  }
}
