import { FileAdapter, newEnforcer } from "casbin"
import { type Permission } from "@unb-libraries/nuxt-layer-entity"

const { APP_ROOT } = process.env
let adapter: typeof FileAdapter
let enforcer: ReturnType<typeof newEnforcer>

export function getCasbinAdapter() {
  if (adapter) { return adapter }
  return new FileAdapter(`${APP_ROOT}/policy.csv`)
}

export async function getCasbinEnforcer() {
  if (enforcer) { return enforcer }
  const adapter = getCasbinAdapter()
  return await newEnforcer(`${APP_ROOT}/model.conf`, adapter)
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
    : `${base}:*`
}

export function createFieldPermissionKeys(permission: Permission) {
  const base = `${permission.action}:${permission.resource}`
  const fields = permission.fields ?? []
  return fields.length > 0
    ? fields.map(field => `${base}:${field}`)
    : [`${base}:*`]
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

export async function getRolePermissions(...roles: string[]) {
  const enforcer = await getCasbinEnforcer()
  const policies = (await Promise.all(roles.map(role => enforcer.getFilteredPolicy(0, role)))).reduceRight((acc, val) => acc.concat(val), [])
  return createPermissionsMap(policies)
}

export async function getRolePermissionsKey(role: string) {
  return (await getRolePermissions(role)).map(createPermissionKey)
}
