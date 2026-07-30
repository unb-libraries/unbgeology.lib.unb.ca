import { EntityFieldTypes } from "~~/types/entity"
import { DocumentBase } from "../utils/schema"
import type { User as UserEntity, Entity, Permission } from "@unb-libraries/nuxt-layer-entity"
import type { DocumentBase as IDocumentBase } from "~~/types/schema"
import type { Authorize as IAuthorize } from "#server/utils/mixins/Authorize"

export interface User extends Omit<UserEntity, keyof Entity | `permissions`>, IAuthorize, IDocumentBase {
  permissions: Permission[]
}

export function renderUser(user: User) {
  return {
    ...renderDocumentBase(user),
    username: user.username,
    active: user.active,
    profile: user.profile,
    roles: user.roles,
  }
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
  alterSchema: (schema) => {
    schema.index({ active: 1, username: 1 })
    schema.index({ "active": 1, "profile.firstName": 1, "profile.lastName": 1 })
    schema.index({ "username": `text`, "profile.firstName": `text`, "profile.lastName": `text` }, { name: `full_text_search` })
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
