import type { RouteLocationNormalized } from "vue-router"
import { readBody } from "h3"

export default defineNuxtRouteMiddleware(async (from: RouteLocationNormalized, to: RouteLocationNormalized) => {
  if (process.client) { return }

  const event = useRequestEvent()
  const { host } = event.node.req.headers
  const { method } = event.node.req
  const { $saml } = useNuxtApp()

  if (method === `GET`) {
    const redirectTo = await $saml.getAuthorizeUrlAsync(``, host, {})
    return navigateTo(redirectTo, { external: true, redirectCode: 302 })
  }

  if (method === `POST`) {
    const { SAMLResponse } = await readBody(event)
    const { profile } = await $saml.validatePostResponseAsync({ SAMLResponse })
    if (profile?.uid) {
      event.context.session.uid = profile.uid
    }
    return navigateTo({ path: `/` })
  }
})
