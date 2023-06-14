import { type NitroApp } from "nitropack"
import mongoose from "mongoose"

const {
  MONGODB_URI,
  MONGODB_AUTH_DB,
} = process.env

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
  if (!MONGODB_URI) {
    throw new Error(`No MongoDB connection string provided.`)
  }

  await mongoose.connect(MONGODB_URI, {
    authSource: MONGODB_AUTH_DB,
  })
  console.info(`Connected to MongoDB.`)
})
