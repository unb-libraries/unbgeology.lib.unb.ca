import { createError, readBody, sendRedirect, useSession } from "h3"
import { getSamlProfile } from "../../../saml/saml"

export default defineEventHandler(async (event) => {
  const { SAMLResponse, RelayState = `/` } = await readBody(event)

  const sessionConfig = useServerSessionConfig()
  const session = await useSession(event, sessionConfig)
  const {
    uid: username,
    mail: email,
    telephoneNumber: phone,
    sn: lastName,
    givenName: firstName,
  } = await getSamlProfile(SAMLResponse)

  // REFACTOR: Avoid making direct DB call, use API instead.
  const user = await User.findOne()
    .where(`username`).eq(username)
    .select(`username`, `roles`, `active`)

  if (user?.active) {
    await user.update({
      profile: {
        email,
        phone,
        lastName,
        firstName,
      },
    })
  } else {
    throw createError({ status: 404, statusText: `User not found` })
  }

  await session.update({
    id: user?._id,
    user: user.username,
    authenticated: true,
    profile: {
      firstName,
      lastName,
    },
    permissions: (await getUserPermissions(username)).map(createFieldPermissionKeys).flat(),
    validUntil: new Date().valueOf() + sessionConfig.maxAge * 1000,
  })

  return sendRedirect(event, RelayState, 302)
})
