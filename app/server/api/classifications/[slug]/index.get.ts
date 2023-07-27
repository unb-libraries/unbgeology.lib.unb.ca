import Classification from "entity-types/Classification"
import { resolveURL } from "ufo"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const path = getRequestPath(event)

  const doc = await Classification
    .findOne({ slug })
    .select(`-_id -__v -super`)

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  return {
    self: path,
    ...doc.toJSON(),
    super: {
      self: resolveURL(path, `super`),
    },
    sub: {
      self: resolveURL(path, `sub`),
    },
  }
})
