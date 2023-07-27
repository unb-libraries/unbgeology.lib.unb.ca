import Classification from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  const doc = await Classification
    .findOne({ slug })
    .select(`-_id -__v -super`)

  const classification = doc.toJSON()
  classification.links = {
    self: `/api/classifications/${classification.slug}`,
    super: `/api/classifications/${classification.slug}/super`,
    sub: `/api/classifications/${classification.slug}/sub`,
  }

  if (!classification) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  return classification
})
