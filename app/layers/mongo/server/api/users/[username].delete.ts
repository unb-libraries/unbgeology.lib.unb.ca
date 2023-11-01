export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  await User.findOneAndDelete({ username })
  return sendNoContent(event)
})
