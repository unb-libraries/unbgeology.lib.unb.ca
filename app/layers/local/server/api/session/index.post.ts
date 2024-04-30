import { useSession } from "h3"
import type { EntityJSON, User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event)
  const user = await $fetch<EntityJSON<User, `username` | `permissions` | `active`>>(`/api/users/${username}`, {
    query: {
      select: [`username`, `permissions`, `active`],
    },
  })

  if (!user) {
    throw createError({ status: 400, message: `Invalid username.` })
  }

  if (!user.active) {
    throw createError({ status: 400, message: `User is not active.` })
  }

  const sessionConfig = useServerSessionConfig()
  const session = await useSession(event, sessionConfig)
  await session.update({
    user: user.username,
    permissions: user.permissions,
    validUntil: new Date().valueOf() + sessionConfig.maxAge * 1000,
  })

  setResponseStatus(event, 200)
})
