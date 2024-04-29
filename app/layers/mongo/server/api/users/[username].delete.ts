export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)

  const user = await User.deleteOne().where(`username`).eq(username)
  if (user) {
    await removeUser(user.username)
    return sendNoContent(event)
  }

  return create404(`User not found`)
})
