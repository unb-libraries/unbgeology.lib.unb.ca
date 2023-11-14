import { EntityFieldTypes, type EntityDocument } from "layers/mongo/types/entity"
import { type User } from "layers/base/types/entity"

type UserDocument = EntityDocument<User>

export default defineEntityType<UserDocument>(`User`, {
  username: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
    alias: `pk`,
  },
  profile: {
    firstName: {
      type: EntityFieldTypes.String,
      required: false,
    },
    lastName: {
      type: EntityFieldTypes.String,
      required: false,
    },
    email: {
      type: EntityFieldTypes.String,
      required: false,
    },
    phone: {
      type: EntityFieldTypes.String,
      required: false,
    },
  },
})
