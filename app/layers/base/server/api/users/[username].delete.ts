import User from "~/server/entityTypes/User"

export default defineEventHandler(requireAuthentication(async (event) => {
  const { username } = getRouterParams(event)

  const { deletedCount } = await User.deleteOne({ username })
  if (!deletedCount) {
    throw createError({ statusCode: 404, statusMessage: `User object with username ${username} does not exist.` })
  }

  setResponseStatus(event, 204, `Delete user object.`)
  return null
}))
