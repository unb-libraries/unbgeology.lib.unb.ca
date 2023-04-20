import type { RouteLocationNormalized } from "vue-router"
import { sendRedirect } from "h3"

export default defineNuxtRouteMiddleware((from: RouteLocationNormalized, to: RouteLocationNormalized) => {
  if (process.client) { return }

  const event = useRequestEvent()
  if (!event.context.session.uid) {
    // Use instead of navigateTo to avoid ERR_HTTP_HEADERS_SENT error
    return sendRedirect(event, `/login`, 302)
  }
})
