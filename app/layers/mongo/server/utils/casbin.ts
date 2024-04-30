import { newEnforcer } from "casbin"
import { MongooseAdapter } from "casbin-mongoose-adapter"
import { type HTTPMethod } from "h3"
import { type Permission } from "@unb-libraries/nuxt-layer-entity"

let adapter: ReturnType<typeof MongooseAdapter[`newAdapter`]>
let enforcer: ReturnType<typeof newEnforcer>

export async function getMongooseCasbinAdapter() {
  if (adapter) { return adapter }

  const uri = getMongooseConnectURI()
  const connectOptions = getMongooseConnectOptions()

  return await MongooseAdapter.newAdapter(uri, connectOptions)
}

export async function getCasbinEnforcer() {
  if (enforcer) { return enforcer }

  const { APP_ROOT } = process.env
  const adapter = await getMongooseCasbinAdapter()
  return await newEnforcer(`${APP_ROOT}/model.conf`, adapter)
}

export async function createUserRole(role: string, permissions: Permission[], options?: Partial<{ base: string }>) {
  const enforcer = await getCasbinEnforcer()

  if (options?.base) {
    await enforcer.addRoleForUser(role, options.base)
  }

  await Promise.all(permissions.map((permission) => {
    const [action, resource, fields] = [permission.action, permission.resource, permission.fields]
    return enforcer.addPolicy(role, resource, fields?.includes(`*`) ? `*` : fields?.join(`|`) ?? `*`, (Array.isArray(action) ? action : [action]).join(`|`))
  }))
}

export async function addUserRole(username: string, ...roles: string[]) {
  const enforcer = await getCasbinEnforcer()
  await Promise.all(roles.map(role => enforcer.addRoleForUser(username, role)))
}

export async function getUserRoles(username: string) {
  const enforcer = await getCasbinEnforcer()
  return enforcer.getRolesForUser(username)
}

export async function setUserRoles(username: string, ...roles: string[]) {
  const enforcer = await getCasbinEnforcer()
  await enforcer.deleteRolesForUser(username)
  await Promise.all(roles.map(role => enforcer.addRoleForUser(username, role)))
}

export async function removeUserRole(username: string, role: string) {
  const enforcer = await getCasbinEnforcer()
  await enforcer.deleteRoleForUser(username, role)
}

export async function removeAllUserRoles(username: string) {
  const enforcer = await getCasbinEnforcer()
  await enforcer.deleteRolesForUser(username)
}

export async function removeUser(username: string) {
  const enforcer = await getCasbinEnforcer()
  await enforcer.deleteUser(username)
}

export function createPermission(action: string, resource: string, fields?: string[]): Permission
export function createPermission(str: string): Permission
export function createPermission(actionOrPermission: string, resource?: string, fields?: string[]) {
  if (resource) {
    return {
      action: actionOrPermission,
      resource,
      fields,
    }
  }

  const action = actionOrPermission.substring(0, actionOrPermission.indexOf(`:`))
  const res = actionOrPermission.substring(actionOrPermission.indexOf(`:`) + 1, actionOrPermission.lastIndexOf(`:`))
  const fieldStr = actionOrPermission.substring(actionOrPermission.lastIndexOf(`:`) + 1)
  return {
    action,
    resource: res,
    fields: fieldStr === `*` ? [] : fieldStr.split(`_`),
  }
}

export function createPermissionKey(permission: Permission) {
  const base = `${permission.action}:${permission.resource}`
  const fields = permission.fields ?? []
  return fields.length > 0
    ? `${base}:${fields.join(`_`)}`
    : base
}

export function createFieldPermissionKeys(permission: Permission) {
  const base = `${permission.action}:${permission.resource}`
  const fields = permission.fields ?? []
  return fields.length > 0
    ? fields.map(field => `${base}:${field}`)
    : [base]
}

function createPermissionsMap(policies: string[][]) {
  const reducer = (obj: Record<string, Permission>, permission: Permission) => {
    const key = createPermissionKey(permission)
    return {
      ...obj,
      [key.substring(0, key.lastIndexOf(`:`))]: {
        ...permission,
        fields: [...obj[key]?.fields ?? [], ...permission.fields ?? []].filter((field, index, arr) => arr.indexOf(field) === index),
      },
    }
  }

  return Object.values(policies.map(([, resource, fields, action]) => {
    return action.split(`|`).map(action => ({
      action,
      resource,
      fields: (fields && fields.split(`|`).filter(f => f)) || [],
    }))
  }).flat().reduce(reducer, {}))
}

export async function getRolePermissions(role: string) {
  const enforcer = await getCasbinEnforcer()
  const policies = (await enforcer.getFilteredPolicy(0, role))
  return createPermissionsMap(policies)
}

export async function getRolePermissionsKey(role: string) {
  return (await getRolePermissions(role)).map(createPermissionKey)
}

export async function getUserPermissions(username: string): Promise<Permission[]> {
  const enforcer = await getCasbinEnforcer()
  const roles = (await enforcer.getFilteredGroupingPolicy(0, username)).flat()
  const policies = (await Promise.all(roles.map(role => enforcer.getFilteredPolicy(0, role)))).reduceRight((acc, val) => acc.concat(val), [])
  return createPermissionsMap(policies)
}

function arrayRegexMatch(keys: string[], pattern: string) {
  const regex = new RegExp(pattern)
  return keys.every(key => regex.test(key))
}

export async function permissionGranted(user: string, uri: string, op: HTTPMethod, fields: string[]) {
  const enforcer = await getCasbinEnforcer()
  enforcer.addFunction(`arrayRegexMatch`, arrayRegexMatch)

  return await enforcer.enforce(user, uri, fields, op)
}
