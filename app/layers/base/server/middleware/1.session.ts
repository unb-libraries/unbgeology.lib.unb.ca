export default defineEventHandler(async (event) => {
  const { data, update } = await useSession(event, useServerSessionConfig())

  if (!data.user) {
    const { defaultUser } = useRuntimeConfig()
    const username = typeof defaultUser === `function` ? defaultUser(event) : defaultUser
    if (username) {
      await update({
        user: username,
        permissions: (await getUserPermissions(username))
          .map(createFieldPermissionKeys)
          .flat(),
        validUntil: new Date().valueOf() + 60 * 60 * 12,
      })
    }
  }
})
