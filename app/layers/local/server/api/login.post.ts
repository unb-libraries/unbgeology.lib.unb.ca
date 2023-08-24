import User from "~/server/entityTypes/User"

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event)

  const user = await User.findOne({ username })
  if (!user) {
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
