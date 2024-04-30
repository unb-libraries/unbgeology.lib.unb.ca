import { type User as UserEntity, type Entity, type Permission } from "@unb-libraries/nuxt-layer-entity"
import { EntityFieldTypes } from "../../types/entity"
import { DocumentBase } from "../utils/schema"
import { type DocumentBase as IDocumentBase } from "../../types/schema"

export interface User extends Omit<UserEntity, keyof Entity | `permissions`>, IDocumentBase {
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
  permissions: {
    type: [{
      action: EntityFieldTypes.String,
      resource: EntityFieldTypes.String,
      fields: [{
        type: EntityFieldTypes.String,
        required: false,
        default: [],
      }],
    }],
    required: false,
  },
}, {
  alterSchema(schema) {
    schema.pre(`save`, async function () {
      this.permissions = (await Promise.all(this.roles
        .map(async role => (await getRolePermissions(role))
          .flat())))
        .flat()
    })

    schema.post(`save`, async function () {
      await setUserRoles(this.username, ...this.roles)
    })
  },
}).mixin(DocumentBase())())
