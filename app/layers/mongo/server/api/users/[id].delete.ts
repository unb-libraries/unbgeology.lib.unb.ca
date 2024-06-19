export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const resources = getAuthorizedResources(event, r => /^user(:\w)*$/.test(r))

  const user = await User.findByID(id)
  if (user && !user.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  await user?.delete()
  return user ? sendNoContent(event) : create404(`User not found`)
})
