export default defineEventHandler(async (event) => {
  const { data, update, clear } = await useSession(event, useServerSessionConfig())
  if (!data?.user) {
    const { validUntil, authenticated } = data
    const now = new Date().valueOf()
    const expired = validUntil ? validUntil < now : false
    if (!authenticated && expired) {
      await clear()
    }

    // TODO: Make the default user configurable, e.g. for convenience in dev/local environments.
    await update({
      user: ``,
      authenticated: false,
      permissions: (await getRolePermissions(`public`))
        .map(createFieldPermissionKeys)
        .flat(),
      validUntil: new Date().valueOf() + 60 * 60 * 12,
    })
  }
})
