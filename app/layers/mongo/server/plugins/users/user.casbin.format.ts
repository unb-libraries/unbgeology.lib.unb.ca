import { type Permission, type User } from "@unb-libraries/nuxt-layer-entity"

export default defineEntityFormatter<Pick<User, `roles`> & { permissions: Permission[] }>((entity, { type }): Partial<User> => {
  if (type?.toLowerCase() !== `userauth`) { return {} }

  const { roles, permissions } = entity
  return {
    roles,
    permissions: permissions && permissions
      .map(({ action, resource, fields }) => (fields ?? [`*`]).map(field => `${action}:${resource}.${field}`)).flat()
      .map(permission => permission.replaceAll(/[.:]/g, `__`))
      .map(permission => permission.replaceAll(/[<>]/g, `_`))
      .map(permission => permission.replaceAll(/(^_)|(_*\*?$)/g, ``)),
    // permissions,
  }
})
