import { newEnforcer } from "casbin"
import { MongooseAdapter } from "casbin-mongoose-adapter"
import { type HTTPMethod } from "h3"
import { type Permission } from "../../types/casbin"

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

function arrayRegexMatch(keys: string[], pattern: string) {
  const regex = new RegExp(pattern)
  return keys.every(key => regex.test(key))
}

export async function permissionGranted(user: string, uri: string, op: HTTPMethod, fields: string[]) {
  const enforcer = await getCasbinEnforcer()
  enforcer.addFunction(`arrayRegexMatch`, arrayRegexMatch)

  return await enforcer.enforce(user, uri, fields, op)
}
