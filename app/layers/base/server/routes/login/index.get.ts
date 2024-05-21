import { getSamlAuthUrl, initSaml } from "../../../saml/saml"

export default defineEventHandler(async (event) => {
  const host = getRequestHost(event)
  const { redirect } = getQuery(event)

  const params = {
    additionalParams: {
      RelayState: Array.isArray(redirect)
        ? redirect.at(-1)
        : redirect ?? `/`,
    },
  }

  initSaml(useRuntimeConfig().public.saml)
  const samlUrl = await getSamlAuthUrl(host!, params)
  return sendRedirect(event, samlUrl, 302)
})
