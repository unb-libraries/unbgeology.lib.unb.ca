import { type Profile } from "entity-types/Profile"
import { EntityFieldTypes, type Entity } from "~/layers/mongo/types/entity"

export interface User extends Entity {
  username: string
  profile?: Profile
  lastLogin?: Date
}

export default defineEntityType<User>(`User`, {
  username: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  profile: {
    type: EntityFieldTypes.ObjectId,
    ref: `Profile`,
    required: false,
  },
  lastLogin: {
    type: EntityFieldTypes.Date,
    required: false,
  },
}, { pk: `username` })
