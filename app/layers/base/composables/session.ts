import { type SessionData } from "h3"

export async function useCurrentSession() {
  const { name } = useSessionConfig()
  const { data: session, refresh } = await useFetch<SessionData>(`/api/session`, {
    headers: {
      Cookie: `${name}=${useCookie(name)}`,
    },
  })

  return {
    session: readonly(session),
    refresh,
  }
}

export function useSessionConfig() {
  return {
    ...useRuntimeConfig().public.session,
    ...useRuntimeConfig().session,
  }
}
