interface User {
  username: string
  email: string
  phone: string
  lastName: string
  firstName: string
  created: Date
  lastLogin: Date
}
type UserCollection = {[username: keyof User.username]: User}

export { User, UserCollection }