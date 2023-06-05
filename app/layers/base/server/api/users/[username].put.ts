import { type User, UserCollection } from "~~/types/user"

export default defineEventHandler(requireAuthentication(async (event) => {
  const storage = useStorage(`db`)

  const { username } = event.context.params!
  const users = (await storage.getItem(`users`) || {}) as UserCollection

  if (!users[username]) {
    throw createError({ statusCode: 404, statusMessage: `User does not exist.` })
  }

  const body: Partial<User> = await readBody(event)
  const user = users[username]
  const partiallyUpdatedUser: Partial<User> = Object.fromEntries(
    Object.entries(body).filter(([key, _]) => key in user),
  )

  users[username] = { ...user, ...partiallyUpdatedUser }
  storage.setItem(`users`, users)

  return users[username]
}))
