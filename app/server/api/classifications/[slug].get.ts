import Classification from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  const classification = await Classification
    .findOne({ slug })
    .populate({ path: `super`, select: { _id: 0, name: 1, slug: 1 } })
    .select({ _id: 0, __v: 0 })

  if (!classification) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  return classification
})
