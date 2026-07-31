import { createError, readBody, sendRedirect } from "h3"

export default defineEventHandler(async (event) => {
  const { SAMLResponse, RelayState = `/` } = await readBody(event)

  const {
    uid: username,
    mail: email,
    telephoneNumber: phone,
    sn: lastName,
    givenName: firstName,
  } = await useSaml().getProfile(SAMLResponse)

  // REFACTOR: Avoid making direct DB call, use API instead.
  const user = await User.mongoose.model
    .findOne({ username })
    .select(`username roles active`)

  if (user?.active) {
    user.set(`profile`, {
      email,
      phone,
      lastName,
      firstName,
    })
    await user.save()
  } else {
    throw createError({ status: 404, statusText: `User not found` })
  }

  const rolePermissions = await getRolePermissions(...(user.roles ?? []))
  const permissions = rolePermissions.map(createFieldPermissionKeys).flat()
  const sessionMaxAge = useRuntimeConfig().session.maxAge ??  60 * 60 * 24

  await replaceUserSession(event, {
    user: {
      id: user._id,
      username: user.username,
      profile: {
        firstName,
        lastName,
      },
    },
    permissions,
    validUntil: Date.now() + (sessionMaxAge * 1000),
  })

  return sendRedirect(event, RelayState, 302)
})
