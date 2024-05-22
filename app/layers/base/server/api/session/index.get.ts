import type { UserSession } from '../../../types/session'

export default defineEventHandler((event) => {
  const { name } = useServerSessionConfig()
  return event.context.sessions![name]! as UserSession
})
