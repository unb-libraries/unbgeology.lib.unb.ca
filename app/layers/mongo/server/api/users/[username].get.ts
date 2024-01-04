import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const user = await User.findByPK(username)
    .select(getSelectedFields(select))

  return sendEntityOr404<User>(event, user)
})
