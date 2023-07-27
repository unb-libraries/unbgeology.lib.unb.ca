import { resolveURL } from "ufo"
import Classification from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const basePath = resolveURL(``, ...getRequestPath(event).split(`/`, 3).slice(-2))

  const doc = await Classification.findOne({ slug })
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  const docs = await Classification.aggregate()
    .match({ slug })
    .graphLookup({
      from: `classifications`,
      startWith: `$_id`,
      connectFromField: `_id`,
      connectToField: `super`,
      as: `sub`,
      depthField: `__d`,
      maxDepth: 0,
    })
    .unwind(`sub`)
    .sort({ "sub.__d": -1 })
    .project(`-_id sub`)
    .project(`-sub._id -sub.__v -sub.__d -sub.super`)

  return docs
    .map((doc: any) => doc.sub)
    .map((doc: any) => ({
      self: resolveURL(basePath, doc.slug),
      ...doc,
      super: {
        self: resolveURL(basePath, doc.slug, `super`),
      },
      sub: {
        self: resolveURL(basePath, doc.slug, `sub`),
      },
    }))
})
