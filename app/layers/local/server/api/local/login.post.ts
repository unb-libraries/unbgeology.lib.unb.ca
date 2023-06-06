export default defineEventHandler(async (event) => {
  const { username } = await readBody(event)

  const storage = useStorage(`db`)
  const users = await storage.getItem(`users`)
  if (!users[username]) {
    throw createError({ statusCode: 405, statusMessage: `Authentication failed.` })
  }

  const sessionConfig = useServerSessionConfig()
  const session = await useSession(event, sessionConfig)
  await session.update({
    user: username,
    validUntil: new Date().valueOf() + sessionConfig.cookie.maxAge,
  })

  return {
    authenticated: true,
  }
})
