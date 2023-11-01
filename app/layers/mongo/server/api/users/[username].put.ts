import { type User } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const body = await readBody(event)
  const user = await User.findOneAndUpdate({ username }, body, { new: true })
  return sendEntityOr404<User>(event, user)
})
