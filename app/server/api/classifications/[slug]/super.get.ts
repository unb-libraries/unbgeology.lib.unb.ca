import Classification from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  if (!await Classification.findOne({ slug })) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  const docs = await Classification.aggregate()
    .match({ slug })
    .graphLookup({
      from: `classifications`,
      startWith: `$super`,
      connectFromField: `super`,
      connectToField: `_id`,
      as: `super`,
      depthField: `__d`,
    })
    .unwind(`super`)
    .sort({ "super.__d": -1 })
    .project(`-_id super`)
    .project(`-super._id -super.__v -super.__d -super.super`)

  return docs.map((classification: any) => {
    classification.super.links = {
      self: `/api/classifications/${classification.super.slug}`,
      super: `/api/classifications/${classification.super.slug}/super`,
    }
    return classification.super
  })
})
