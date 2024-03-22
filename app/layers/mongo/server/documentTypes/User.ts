import { type User as UserEntity, type Entity } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import { type DocumentBase } from "../../types/schema"

interface User extends Omit<UserEntity, keyof Entity>, DocumentBase {}

export default defineDocumentModel<User>(`User`, defineDocumentSchema<User>({
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
})())
