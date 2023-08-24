import Person, { type IPerson } from "./Person"
import { EntityFieldTypes, type Entity } from "~/types/entity"

export interface IUser extends Entity {
  username: string
  profile?: IPerson
  lastLogin?: Date
}

export default defineEntityType<IUser>(`User`, {
  username: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  profile: Person,
  lastLogin: {
    type: EntityFieldTypes.Date,
    required: false,
  },
})
