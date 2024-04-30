import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)

  const query = User.findOne()
    .where(`username`).eq(username)
  await useEventQuery(event, query)

  const user = await query
  return renderDocumentOr404(user, { model: User })
})
