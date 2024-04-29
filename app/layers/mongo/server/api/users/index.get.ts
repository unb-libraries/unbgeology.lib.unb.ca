export default defineEventHandler(async (event) => {
  const { page, pageSize, select } = getQueryOptions(event)

  const query = User.find()
  await useEventQuery(event, query)
  const { documents: users, total } = await query
    .select([`_username`, `$username`])
    .paginate(page, pageSize)

  const documentList = await renderDocumentList(users, {
    model: User,
    total,
    canonical: {
      // @ts-ignore
      self: user => `/api/users/${user._username}`,
    },
  })

  // @ts-ignore
  const authEntities = await Promise.all(users.map(async ({ _username }) => render<User>({
    username: _username,
    roles: select.includes(`roles`) || select.length < 1 ? await getUserRoles(_username) : undefined,
    permissions: select.includes(`permissions`) || select.length < 1 ? await getUserPermissions(_username) : undefined,
  }, { type: `userAuth` })))

  return {
    ...documentList,
    entities: documentList.entities.map((entity, index) => ({
      ...entity,
      roles: authEntities[index].roles,
      permissions: authEntities[index].permissions,
    })),
  }
})
