import type { RouteLocationNormalized, RouteMeta } from "vue-router"
import { sendRedirect } from "h3"

interface AuthMeta {
  public: boolean
  redirect: boolean
}

interface RouteAuthMeta extends RouteMeta {
  auth?: AuthMeta
}

export default defineNuxtRouteMiddleware((from: RouteLocationNormalized, to: RouteLocationNormalized) => {
  if (process.client) { return }

  const event = useRequestEvent()
  const auth = {
    public: true,
    redirect: false,
    ...(from.meta as RouteAuthMeta).auth || {},
  }

  if (!auth.public && !event.context.session.uid) {
    // Use instead of navigateTo to avoid ERR_HTTP_HEADERS_SENT error
    if (auth.redirect) {
      return sendRedirect(event, `/login`, 302)
    }
    return abortNavigation({ statusCode: 403, message: `Unauthorized` })
  }
})
