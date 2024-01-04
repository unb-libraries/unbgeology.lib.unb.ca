import { type User } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes, type EntityDocument } from "../../types/entity"

type UserDocument = EntityDocument<User>

export default defineDocumentType<UserDocument>(`User`, {
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
