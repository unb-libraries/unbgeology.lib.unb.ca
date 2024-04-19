export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const user = await User.deleteOne().where(`username`).eq(username)
  return user ? sendNoContent(event) : create404(`User not found`)
})
