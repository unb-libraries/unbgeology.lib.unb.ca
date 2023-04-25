import type { RouteLocationNormalized } from "vue-router"
import { readBody } from "h3"

export default defineNuxtRouteMiddleware(async (from: RouteLocationNormalized, to: RouteLocationNormalized) => {
  if (process.client) { return }

  const event = useRequestEvent()
  const { host } = event.node.req.headers
  const { method } = event.node.req
  const { $saml } = useNuxtApp()

  if (from.path === `/login` && method === `GET`) {
    const redirect = from.query.redirect as string
    const params = redirect
      ? {
          additionalParams: {
            RelayState: redirect,
          },
        }
      : {}
    const samlUrl = await $saml.getAuthorizeUrlAsync(``, host, params)
    return navigateTo(samlUrl, { external: true, redirectCode: 302 })
  }

  if (from.path === `/login/saml` && method === `POST`) {
    const { SAMLResponse, RelayState } = await readBody(event)
    const { profile } = await $saml.validatePostResponseAsync({ SAMLResponse })
    if (profile?.uid) {
      event.context.session.uid = profile.uid
    }
    return navigateTo({ path: RelayState || `/` })
  }
})
