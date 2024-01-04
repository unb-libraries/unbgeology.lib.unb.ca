import mongoose, { type ConnectOptions } from "mongoose"

export default defineNitroPlugin(async (nitroApp) => {
  const { uri, user, pass, host, port, db, authSource } = useRuntimeConfig().nitro.mongodb

  const connectOptions: ConnectOptions = {}
  if (authSource) {
    connectOptions.authSource = authSource
  }

  await mongoose.connect(uri || `mongodb://${user}:${pass}@${host}:${port}/${db}`, connectOptions)
  console.info(`Connected to MongoDB.`)
})
