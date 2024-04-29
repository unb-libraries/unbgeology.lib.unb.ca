import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { page, pageSize } = getQueryOptions(event)

  const body = await readOneDocumentBodyOr400(event, { model: User, flat: true })
  const query = User.update(body)
  await useEventQuery(event, query)
  const { documents: updates, total } = await query
    .paginate(page, pageSize)

  const rolesAndPermissionsUpdates = await Promise.all(updates.map(async ([before]) => {
    const { username } = before
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

    return [previousRolesAndPermissions, currentRolesAndPermissions] as [typeof previousRolesAndPermissions, typeof currentRolesAndPermissions]
  }))

  const documentDiffs = await renderDocumentDiffList(updates, {
    model: User,
    total,
    canonical: {
    // @ts-ignore
      self: (user: { _username: string }) => `/api/users/${user.username}`,
    },
  })
  const authEntityDiffs = await Promise.all(rolesAndPermissionsUpdates.map(update => renderDiff<User>(update, { type: `userAuth` })))

  return {
    ...documentDiffs,
    entities: documentDiffs.entities.map((entity, index) => ({
      ...entity,
      roles: authEntityDiffs[index].roles,
      permissions: authEntityDiffs[index].permissions,
      previous: {
        ...entity.previous,
        roles: authEntityDiffs[index].previous.roles,
        permissions: authEntityDiffs[index].previous.permissions,
      },
    })),
  }
})
