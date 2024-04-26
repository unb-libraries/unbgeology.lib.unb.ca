import mongoose from "mongoose"

export default defineNitroPlugin(async (nitro) => {
  const uri = getMongooseConnectURI()
  const connectOptions = getMongooseConnectOptions()
  const conn = await mongoose.connect(uri, connectOptions)
  nitro.hooks.callHook(`mongoose:init`, conn)
})
