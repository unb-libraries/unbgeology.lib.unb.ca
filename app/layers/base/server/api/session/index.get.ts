import type { SessionData } from 'h3'

export default defineEventHandler((event) => {
  const { name } = useServerSessionConfig()
  return event.context.sessions?.[name] as SessionData
})
