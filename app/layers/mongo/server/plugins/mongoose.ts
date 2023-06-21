import Specimen from "entity-types/Specimen"
import mongoose from "mongoose"
import { type NitroApp } from "nitropack"

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
  const { uri, authDb } = useRuntimeConfig().mongodb

  if (!uri) {
    throw new Error(`No MongoDB connection string provided.`)
  }

  await mongoose.connect(uri, {
    authSource: authDb,
  })
  console.info(`Connected to MongoDB.`)

  await Specimen.init()
  console.info(`Initialized Specimen collection.`)
})
