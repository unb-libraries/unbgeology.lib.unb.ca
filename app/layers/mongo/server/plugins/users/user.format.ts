export default defineMongooseFormatter(User, (doc) => {
  const { username, active, profile, roles, permissions, created, updated } = doc
  return {
    username,
    active,
    profile: (profile && Object.keys(profile).length > 0 && {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    }) || undefined,
    roles,
    permissions: permissions && permissions.map(createFieldPermissionKeys).flat(),
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
