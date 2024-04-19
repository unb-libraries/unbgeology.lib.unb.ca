export default defineMongooseFormatter(User, (doc) => {
  const { username, active, profile, created, updated } = doc
  return {
    username,
    active,
    profile: (profile && Object.keys(profile).length > 0 && {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    }) || undefined,
    created: (created && !isNaN(created) && new Date(created).toISOString()) || undefined,
    updated: (updated && !isNaN(updated) && new Date(updated).toISOString()) || undefined,
  }
})
