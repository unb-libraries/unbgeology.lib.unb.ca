import type { H3Event, Session } from 'h3'

export function useCurrentServerSession(event: H3Event) {
  const { name } = useServerSessionConfig()
  return event.context.sessions?.[name] as Session<{
    user: string
    permissions: string[]
    validUntil: number
  }>
}

export function useServerSessionConfig() {
  return {
    ...useRuntimeConfig().public.session,
    ...useRuntimeConfig().session,
  }
}
