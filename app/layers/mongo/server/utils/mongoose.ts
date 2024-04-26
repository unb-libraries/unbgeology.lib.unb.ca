import { type ConnectOptions } from "mongoose"

export function getMongooseConnectURI() {
  const { uri, user, pass, host, port, db } = useRuntimeConfig().nitro.mongodb
  return uri || `mongodb://${user}:${pass}@${host}:${port}/${db}`
}

export function getMongooseConnectOptions() {
  const { authSource } = useRuntimeConfig().nitro.mongodb
  const connectOptions: ConnectOptions = {}
  if (authSource) {
    connectOptions.authSource = authSource
  }
  return connectOptions
}
