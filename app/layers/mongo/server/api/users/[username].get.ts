import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const query = User.findOne()
    .where(`username`).eq(username)
  await useEventQuery(event, query)
  const user = await query

  const document = await renderDocumentOr404(user, { model: User })
  const authEntity = await renderOr404<User>(user && {
    username,
    roles: select.includes(`roles`) || select.length < 1 ? await getUserRoles(username) : undefined,
    permissions: select.includes(`permissions`) || select.length < 1 ? await getUserPermissions(username) : undefined,
  }, { type: `userAuth` })

  return {
    ...document,
    ...authEntity,
  }
})
