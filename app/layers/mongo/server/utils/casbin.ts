import { newEnforcer } from "casbin"
import { MongooseAdapter } from "casbin-mongoose-adapter"
import { type HTTPMethod } from "h3"

export async function getMongooseCasbinAdapter() {
  const uri = getMongooseConnectURI()
  const connectOptions = getMongooseConnectOptions()
  return await MongooseAdapter.newAdapter(uri, connectOptions)
}

export async function getCasbinEnforcer() {
  const { APP_ROOT } = process.env

  const adapter = await getMongooseCasbinAdapter()
  return await newEnforcer(`${APP_ROOT}/model.conf`, adapter)
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
