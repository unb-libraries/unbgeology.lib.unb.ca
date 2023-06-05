import { type UserCollection } from "~~/types/user"

export default defineEventHandler(requireAuthentication(async (event) => {
  return (await useStorage(`db`).getItem(`users`) || {}) as UserCollection
}))
