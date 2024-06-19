import type { User } from "~/layers/mongo/server/documentTypes/User"

interface UserData {
  username: string
}

export default defineMigrateHandler<UserData, User>(`User`, ({ username }) => {
  return {
    username: username.toLowerCase(),
    active: false,
  }
})
