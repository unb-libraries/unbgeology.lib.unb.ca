import { resolveURL } from "ufo"
import User from "~/server/entityTypes/User"

export default defineEventHandler(requireAuthentication(async (event) => {
  const path = getRequestPath(event)

  const docs = await User
    .find()
    .select(`-__v -_id`)

  return docs
    .map((doc: any) => doc.toJSON())
    .map((doc: any) => ({
      self: resolveURL(path, doc.slug),
      ...doc,
      created: new Date(doc.created),
      updated: new Date(doc.updated),
    }))
}))
