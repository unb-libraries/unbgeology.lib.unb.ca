export default defineEventHandler(async (event) => {
  const host = getRequestHost(event)
  const { redirect } = getQuery(event)

  const url = await useSaml().getAuthUrl(host!, {
    additionalParams: {
      RelayState: Array.isArray(redirect)
        ? redirect.at(-1)
        : redirect ?? `/`,
    },
  })

  return sendRedirect(event, url, 302)
})
