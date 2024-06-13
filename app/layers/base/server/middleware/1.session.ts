export default defineEventHandler(async (event) => {
  const { data, update, clear } = await useSession(event, useServerSessionConfig())
  if (!data?.user) {
    const { validUntil, authenticated } = data
    const now = new Date().valueOf()
    const expired = validUntil ? validUntil < now : false
    if (!authenticated && expired) {
      await clear()
    }
    const { defaultUser } = useRuntimeConfig(event).nitro
    const username = typeof defaultUser === `function` ? defaultUser(event) : defaultUser
    await update({
      user: username || ``,
      authenticated: Boolean(username) && username !== `anonymous`,
      permissions: (await getUserPermissions(username || `anonymous`))
        .map(createFieldPermissionKeys)
        .flat(),
      validUntil: new Date().valueOf() + 60 * 60 * 12,
    })
  }
})
