import { type Entity } from "~/layers/base/types/entity"

export interface User extends Entity {
  username: string
  profile: {
    email: string
    phone: string
    lastName: string
    firstName: string
  }
}