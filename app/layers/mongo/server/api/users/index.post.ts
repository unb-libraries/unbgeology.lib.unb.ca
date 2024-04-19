import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const body = await readBodyOr400<User>(event)
  const userOrUsers = await User.create(body)

  const self = (user: { username: string }) => `/api/users/${user.username}`
  return Array.isArray(userOrUsers)
    ? renderDocumentList(userOrUsers, {
      model: User,
      pageSize: userOrUsers.length,
      canonical: {
        self,
      },
    })
    : renderDocument(userOrUsers, { model: User, self })
})
