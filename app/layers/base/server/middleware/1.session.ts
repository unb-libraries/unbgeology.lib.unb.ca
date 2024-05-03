export default defineEventHandler(async (event) => {
  const { data, update } = await useSession(event, useServerSessionConfig())
  if (!data.user) {
    const { defaultUser } = useRuntimeConfig()
    await update({
      user: defaultUser,
      permissions: (await getUserPermissions(defaultUser))
        .map(createFieldPermissionKeys)
        .reduceRight((all, some) => all.concat(...some), []),
      validUntil: new Date().valueOf() + 60 * 60 * 12,
    })
  }
})
