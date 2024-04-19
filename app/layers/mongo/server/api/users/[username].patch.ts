import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const body = await readOneBodyOr400<User>(event, { flat: true })
  const user = await User.updateOne(body)
    .where(`username`).eq(username)
  return renderDocumentDiffOr404(user, { model: User })
})
