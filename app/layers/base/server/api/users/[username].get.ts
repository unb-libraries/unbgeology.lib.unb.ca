import { type UserCollection } from "~~/types/user"

export default defineEventHandler(requireAuthentication(async (event) => {
  const storage = useStorage(`db`)
  const { username } = event.context.params!

  const users = (await storage.getItem(`users`) || {}) as UserCollection

  if (!users || !users[username]) {
    throw createError({
      statusCode: 404,
      statusMessage: `User not found`,
    })
  }

  return users[username]
}))
