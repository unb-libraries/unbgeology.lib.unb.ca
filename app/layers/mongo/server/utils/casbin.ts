import { newEnforcer } from "casbin"
import { type HTTPMethod } from "h3"

function arrayRegexMatch(keys: string[], pattern: string) {
  const regex = new RegExp(pattern)
  return keys.every(key => regex.test(key))
}

export async function permissionGranted(user: string, uri: string, op: HTTPMethod, fields: string[]) {
  const { APP_ROOT } = process.env

  const enforcer = await newEnforcer(`${APP_ROOT}/model.conf`, `${APP_ROOT}/policy.csv`)
  enforcer.addFunction(`arrayRegexMatch`, arrayRegexMatch)

  return await enforcer.enforce(user, uri, fields, op)
}
