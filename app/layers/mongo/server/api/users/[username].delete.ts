export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))

  const user = await User.findOne().where(`username`).eq(username)
  if (user && !user.authTags.some(t => resources.includes(t))) {
    return create403()
  }
  return user ? sendNoContent(event) : create404(`User not found`)
})
