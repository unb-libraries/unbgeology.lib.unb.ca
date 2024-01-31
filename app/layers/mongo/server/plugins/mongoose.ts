import mongoose, { type ConnectOptions } from "mongoose"

export default defineNitroPlugin(async (nitro) => {
  const { uri, user, pass, host, port, db, authSource } = useRuntimeConfig().nitro.mongodb

  const connectOptions: ConnectOptions = {}
  if (authSource) {
    connectOptions.authSource = authSource
  }

  const conn = await mongoose.connect(uri || `mongodb://${user}:${pass}@${host}:${port}/${db}`, connectOptions)
  nitro.hooks.callHook(`mongoose:init`, conn)
})
