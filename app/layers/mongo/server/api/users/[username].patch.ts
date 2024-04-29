import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)

  const body = await readOneDocumentBodyOr400(event, { model: User, flat: true })
  const update = await User.updateOne(body)
    .where(`username`).eq(username)

  if (update) {
    const previousRolesAndPermissions = {
      roles: await getUserRoles(username),
      permissions: await getUserPermissions(username),
    }

    const { roles } = await readOneBodyOr400<User>(event, { type: `userAuth` })
    await setUserRoles(username, ...roles)

    const currentRolesAndPermissions = {
      roles,
      permissions: await getUserPermissions(username),
    }

    return {
      ...await renderDocumentDiff(update, { model: User }),
      ...await renderDiff<User>([previousRolesAndPermissions, currentRolesAndPermissions], { type: `userAuth` }),
    }
  }

  return create404(`User not found.`)
})
