import User from "~/server/entityTypes/User"

export default defineEventHandler(requireAuthentication(async (event) => {
  const { username } = await readBody(event)
  try {
    await User.create({ username })
    setResponseStatus(event, 201, `Created user object.`)
    return $fetch(`/api/users/${username}`)
  } catch (err: any) {
    throw createError({ statusCode: 409, statusMessage: `User object with ${username} already exists.` })
  }
}))
