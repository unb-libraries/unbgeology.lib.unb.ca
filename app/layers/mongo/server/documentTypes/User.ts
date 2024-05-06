import { type User as UserEntity, type Entity, type Permission } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import { DocumentBase } from "../utils/schema"
import { type DocumentBase as IDocumentBase } from "../../types/schema"
import { type Authorize as IAuthorize } from "../utils/mixins/Authorize"

export interface User extends Omit<UserEntity, keyof Entity | `permissions`>, IAuthorize, IDocumentBase {
  permissions: Permission[]
}

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
  roles: {
    type: [EntityFieldTypes.String],
    required: false,
  },
}, {
  alterSchema(schema) {
    schema.post(`save`, async function () {
      await setUserRoles(this.username, ...this.roles)
    })
  },
}).mixin(Authorize<User>({
  paths: (user) => {
    const { username, active, roles } = user
    return [
      `user`,
      `user:${username}`,
      `user:${active ? `active` : `inactive`}`,
      ...roles.map(role => [`user:${role}`, `user:${role}:${active ? `active` : `inactive`}`]).flat(),
    ]
  },
})).mixin(DocumentBase())())
