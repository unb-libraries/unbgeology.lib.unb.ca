import { type User } from "~/server/entityTypes/User"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const user = await User.findByPK(username)
    .select(getSelectedFields(select))

  return sendEntityOr404<User>(event, user)
})
