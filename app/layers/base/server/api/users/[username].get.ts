import User, { type IUser } from "~/server/entityTypes/User"

export default defineEventHandler(requireAuthentication(async (event) => {
  const { username } = getRouterParams(event)
  const path = getRequestPath(event)

  const doc = await User
    .findOne<IUser>({ username })
    .select(`-__v -_id`)

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `User object with username ${username} does not exist.` })
  }

  return {
    self: path,
    ...doc.toJSON(),
    created: new Date(doc.created),
    updated: new Date(doc.updated),
  }
}))
