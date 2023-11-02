import { type User } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { username } = await readBody(event)
  const user = await User.create({ username })
  if (user) {
    return sendEntity<User>(event, user)
  }
})
