export default defineEventHandler(async (event) => {
  const storage = useStorage(`db`)
  const { user: username } = (await useCurrentServerSession(event)).data
  if (username) {
    const users = (await storage.getItem(`users`) || {}) as UserCollection
    if (users && users[username]) {
      event.context.user = users[username]
    }
  }
})
