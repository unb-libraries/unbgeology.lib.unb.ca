import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const documentBody = await readDocumentBodyOr400(event, { model: User })
  const userOrUsers = await User.create(documentBody)

  if (Array.isArray(userOrUsers)) {
    const casbinBody = await readBodyListOr400<User>(event, { type: `userAuth` })
    await Promise.all(userOrUsers.map((user, index) => addUserRole(user.username, ...casbinBody[index].roles)))
  } else {
    const casbinBody = await readOneBodyOr400<User>(event, { type: `userAuth` })
    await addUserRole(userOrUsers.username, ...casbinBody.roles)
  }

  const self = (user: { username: string }) => `/api/users/${user.username}`
  if (Array.isArray(userOrUsers)) {
    const auth = await Promise.all(userOrUsers.map(async ({ username }) => render<User>({
      username,
      roles: await getUserRoles(username),
      permissions: await getUserPermissions(username),
    }, { type: `userAuth` })))

    const { entities, ...list } = await renderDocumentList(userOrUsers, {
      model: User,
      pageSize: userOrUsers.length,
      canonical: {
        self,
      },
    })

    return {
      ...list,
      entities: entities.map((entity, index) => ({
        ...entity,
        roles: auth[index].roles,
        permissions: auth[index].permissions,
      })),
    }
  } else {
    const { username } = userOrUsers
    return {
      ...await renderDocument(userOrUsers, { model: User, self }),
      ...await render<User>({
        username,
        roles: await getUserRoles(username),
        permissions: await getUserPermissions(username),
      }, { type: `userAuth` }),
    }
  }
})
