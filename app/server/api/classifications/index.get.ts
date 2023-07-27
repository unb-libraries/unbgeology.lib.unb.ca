import Classification from "entity-types/Classification"
import { resolveURL } from "ufo"

export default defineEventHandler(async (event) => {
  const path = getRequestPath(event)

  const docs = await Classification
    .find()
    .select(`-_id -__v -super`)

  return docs
    .map((doc: any) => doc.toJSON())
    .map((doc: any) => ({
      self: resolveURL(path, doc.slug),
      ...doc,
      super: {
        self: resolveURL(path, doc.slug, `super`),
      },
      sub: {
        self: resolveURL(path, doc.slug, `sub`),
      },
    }))
})
