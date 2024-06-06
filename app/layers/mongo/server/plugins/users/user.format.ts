export default defineMongooseFormatter(User, async (doc) => {
  const { _id, username, active, profile, roles, permissions, created, updated } = doc
  return {
    id: _id,
    username,
    active,
    profile: (profile && Object.keys(profile).length > 0 && {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    }) || undefined,
    roles,
    permissions: username && permissions && (await getUserPermissions(username)).map(createFieldPermissionKeys).flat(),
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
