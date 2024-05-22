export default defineNuxtRouteMiddleware(async () => {
  const { name } = useSessionConfig()
  const { data: session } = await useFetch(`/api/session`, {
    headers: {
      Cookie: `${name}=${useCookie(name)}`,
    },
  })
  useState(`session`, () => session)
})
