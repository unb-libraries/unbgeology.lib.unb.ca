import { type User as UserEntity, type Entity } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import { DocumentBase } from "../utils/schema"
import { type DocumentBase as IDocumentBase } from "../../types/schema"

export interface User extends Omit<UserEntity, keyof Entity>, IDocumentBase {}

export default defineDocumentModel<User>(`User`, defineDocumentSchema<User>({
  username: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  active: {
    type: EntityFieldTypes.Boolean,
    required: true,
    default: true,
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
}).mixin(DocumentBase())())
