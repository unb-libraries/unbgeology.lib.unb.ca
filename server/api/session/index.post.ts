import { useSession } from "h3"
import type { EntityJSON, User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username, sessionName } = await readBody(event)

  const resources = getAuthorizedResources(event, r => /^session$/.test(r))
  if (!resources.length) {
    return create403(`Unauthorized.`)
  }

  const user = await $fetch<EntityJSON<User, `username` | `permissions` | `active`>>(`/api/users/${username}`, {
    query: {
      select: [`username`, `permissions`, `active`],
    },
    headers: event.headers,
  })

  if (!user) {
    throw createError({ status: 400, message: `Invalid username.` })
  }

  if (!user.active) {
    throw createError({ status: 400, message: `User is not active.` })
  }

  const sessionConfig = useServerSessionConfig()
  const { update } = await useSession(event, { ...sessionConfig, name: (sessionName && `${sessionName}`) || sessionConfig.name })
  await update({
    user: user.username,
    permissions: user.permissions,
    validUntil: new Date().valueOf() + sessionConfig.maxAge * 1000,
  })

  setResponseStatus(event, 200)
})
