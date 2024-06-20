import { consola } from "consola"
import { createError, readBody, sendRedirect, useSession } from "h3"
import { getSamlProfile } from "../../../saml/saml"

export default defineEventHandler(async (event) => {
  const { SAMLResponse, RelayState = `/` } = await readBody(event)

  consola.log(`SAMLResponse:`, SAMLResponse)

  const sessionConfig = useServerSessionConfig()
  consola.log(`sessionConfig:`, sessionConfig)
  const session = await useSession(event, sessionConfig)
  consola.log(`session:`, session)
  const {
    uid: username,
    mail: email,
    telephoneNumber: phone,
    sn: lastName,
    givenName: firstName,
  } = await getSamlProfile(SAMLResponse)

  consola.log(`profile:`, username, email, phone, lastName, firstName)

  consola.log(`User model:`, User)

  // REFACTOR: Avoid making direct DB call, use API instead.
  const user = await User.findOne()
    .where(`username`).eq(username)
    .select(`username`, `roles`, `active`)

  if (!user) {
    await User.mongoose.model.init()
    consola.log(await User.mongoose.model.find())
  }

  consola.log(`user:`, user)

  if (user?.active) {
    consola.log(`active:`, true)
    await user.update({
      profile: {
        email,
        phone,
        lastName,
        firstName,
      },
    })
    consola.log(`profile updated`)
  } else {
    consola.log(`user not updated`)
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
    permissions: (await getRolePermissions(...(user.roles ?? []))).map(createFieldPermissionKeys).flat(),
    validUntil: new Date().valueOf() + sessionConfig.maxAge * 1000,
  })

  consola.log(`session updated`)

  return sendRedirect(event, RelayState, 302)
})
