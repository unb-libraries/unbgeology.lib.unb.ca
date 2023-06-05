import type { H3Event, SessionData } from 'h3'

export function useCurrentServerSession(event: H3Event) {
  const { name } = useServerSessionConfig()
  return event.context.sessions?.[name] as SessionData
}

export function useServerSessionConfig() {
  return {
    ...useRuntimeConfig().public.session,
    ...useRuntimeConfig().session,
  }
}
