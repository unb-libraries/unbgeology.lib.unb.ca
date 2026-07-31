import type { H3Event, EventHandler, EventHandlerRequest } from "h3"

export function requireAuthentication<T extends EventHandlerRequest = EventHandlerRequest>(handler: EventHandler<T>): EventHandler<T> {
  return async (event) => {
    const { user } = await getUserSession(event)
    if (!user) {
      throw createError({ statusCode: 403, message: `Unauthorized` })
    }
    return handler(event)
  }
}

export function useCurrentUser(event: H3Event) {
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
