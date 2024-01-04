import { type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event)
  const user = await User.create({ username })
  if (user) {
    return sendEntity<User>(event, user)
  }
})
