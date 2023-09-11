import { type Profile } from "entity-types/Profile"
import { EntityFieldTypes, type Entity } from "~/layers/mongo/types/entity"

export interface IUser extends Entity {
  username: string
  profile?: Profile
  lastLogin?: Date
}

export default defineEntityType<IUser>(`User`, {
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
})
