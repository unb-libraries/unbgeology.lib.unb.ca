export default defineEventHandler(async (event) => {
  const { user, permissions } = await getUserSession(event)
  if (!permissions) {
    const publicPermissions = (await getRolePermissions(`public`))
      .map(p => Array.isArray(p.action) ? p.action.map(a => [a, p.resource, p.fields]) : [p.action, p.resource, p.fields] as [string, string, string[]])
      .map(([a, r, f]) => f.map(f => [a, r, f]))
      .flat()
      .map(([a, r, f]) => `${a}:${r}:${f}`)
    await setUserSession(event, {
      permissions: publicPermissions,
    })
    event.context.permissions = publicPermissions
  } else {
    event.context.user = user
    event.context.permissions = permissions ?? []
  }
})
