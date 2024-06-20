import { consola } from "consola"
import mongoose from "mongoose"

export default defineNitroPlugin(async (nitro) => {
  const uri = getMongooseConnectURI()
  const connectOptions = getMongooseConnectOptions()
  const conn = await mongoose.connect(uri, connectOptions)
  if (conn) {
    consola.info(`Connected to MongoDB`)
    nitro.hooks.callHook(`mongoose:init`, conn)
  } else {
    consola.error(`Failed to connect to MongoDB`)
  }
})
