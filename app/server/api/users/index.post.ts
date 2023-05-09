export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)

  const users = await storage.getItem(`users`) || {}
  const user: User = {
    ...{ active: false },
    ...await readBody(event),
  }

  users[user.username] = user
  storage.setItem(`users`, users)

  return user
})
