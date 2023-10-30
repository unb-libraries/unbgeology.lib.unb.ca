import mongoose, { type ConnectOptions } from "mongoose"
import { type NitroApp } from "nitropack"

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
  const { uri, user, pass, host, port, db, authSource } = useRuntimeConfig().mongodb

  const connectOptions: ConnectOptions = {}
  if (authSource) {
    connectOptions.authSource = authSource
  }

  await mongoose.connect(uri || `mongodb://${user}:${pass}@${host}:${port}/${db}`, connectOptions)
  console.info(`Connected to MongoDB.`)
})
