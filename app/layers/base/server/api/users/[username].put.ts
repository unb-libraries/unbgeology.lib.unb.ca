import User from "~/server/entityTypes/User"

export default defineEventHandler(requireAuthentication(async (event) => {
  const { username } = getRouterParams(event)
  const { lastLogin, ...profile } = await readBody(event)

  const profileUpdate = Object.fromEntries(Object.entries(profile)
    .map(([field, value]) => [`profile.${field}`, value]))

  const { matchedCount, modifiedCount } = await User.updateOne({ username }, { lastLogin, ...profileUpdate })
  if (!matchedCount) {
    throw createError({ statusCode: 404, statusMessage: `User object with username ${username} does not exist.` })
  }

  if (!modifiedCount) {
    setResponseStatus(event, 200, `No objects modified.`)
  }

  return $fetch(`/api/users/${username}`)
}))
