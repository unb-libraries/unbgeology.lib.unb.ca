import Classification from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
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

  return docs.map((doc: any) => {
    const classification = doc.sub
    classification.links = {
      self: `/api/classifications/${classification.slug}`,
      super: `/api/classifications/${classification.slug}/super`,
      sub: `/api/classifications/${classification.slug}/sub`,
    }
    return classification
  })
})
