import { type User, UserCollection } from "~~/types/user"

export default defineEventHandler(requireAuthentication(async (event) => {
  const storage = useStorage(`db`)

  const users = (await storage.getItem(`users`) || {}) as UserCollection
  const { username } = await readBody(event)

  if (users[username]) {
    throw createError({ statusCode: 409, statusMessage: `User already exists.` })
  }

  const user: User = {
    username,
    email: ``,
    phone: ``,
    firstName: ``,
    lastName: ``,
  }

  users[username] = user
  storage.setItem(`users`, users)

  return user
}))
