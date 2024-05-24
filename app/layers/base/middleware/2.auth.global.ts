import { sendRedirect } from "h3"
import type { PageMeta } from "#app"

export default defineNuxtRouteMiddleware((_, to) => {
  const requireLogin = () => {
    return sendRedirect(event, `/login?redirect=${to.path}`, 302)
  }

  const event = useRequestEvent()!
  const auth: PageMeta[`auth`] = {
    redirect: false,
    ...to.meta.auth || {},
  }

  const now = new Date().valueOf()
  const { validUntil } = useCurrentSession().value.data
  const expired = validUntil ? validUntil < now : false
  if (expired) {
    return requireLogin()
  }

  const { permission } = auth
  const { hasPermission, isAuthenticated } = useCurrentUser()
  if (permission && !hasPermission(permission)) {
    // Use instead of navigateTo to avoid ERR_HTTP_HEADERS_SENT error
    if (!isAuthenticated && auth.redirect) {
      return requireLogin()
    }
    return abortNavigation({ statusCode: 403, message: `Unauthorized` })
  }
})
