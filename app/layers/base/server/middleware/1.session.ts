export default defineEventHandler(async (event) => {
  const { data, update } = await useSession(event, useServerSessionConfig())
  if (!data.user) {
    await update({
      user: `anonymous`,
      permissions: (await getUserPermissions(`anonymous`))
        .map(createFieldPermissionKeys)
        .reduceRight((all, some) => all.concat(...some), []),
      validUntil: new Date().valueOf() + 60 * 60 * 12,
    })
  }
})
