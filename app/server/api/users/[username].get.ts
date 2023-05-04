export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)
  if (!event.context.params?.username) {
    throw createError({
      statusCode: 400,
      statusMessage: `Username is required`,
    })
  }

  const { username } = event.context.params
  const users = await storage.getItem(`users`) || {}
  if (!users || !users[username]) {
    throw createError({
      statusCode: 404,
      statusMessage: `${username} not found`,
    })
  }

  return users[username]
})
