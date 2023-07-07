import { sendRedirect } from "h3"
import type { RouteLocationNormalized, RouteMeta } from "vue-router"

interface AuthMeta {
  public: boolean
  redirect: boolean
}

interface RouteAuthMeta extends RouteMeta {
  auth?: AuthMeta
}

export default defineNuxtRouteMiddleware(async (from: RouteLocationNormalized, to: RouteLocationNormalized) => {
  if (process.client) { return }

  const event = useRequestEvent()
  const auth = {
    public: true,
    redirect: false,
    ...(from.meta as RouteAuthMeta).auth || {},
  }

  const currentUser = await useCurrentUser()

  const now = new Date().valueOf()
  const { validUntil } = (await useCurrentSession()).session.value!.data
  const expired = validUntil ? validUntil < now : false

  if (!auth.public && (!currentUser || expired)) {
    // Use instead of navigateTo to avoid ERR_HTTP_HEADERS_SENT error
    if (auth.redirect) {
      const redirectTo = to.path
      return sendRedirect(event, `/login?redirect=${redirectTo}`, 302)
    }
    return abortNavigation({ statusCode: 403, message: `Unauthorized` })
  }
})
