import Classification from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  const docs = await Classification
    .find()
    .select(`-_id -__v -super`)

  return docs.map((doc: any) => {
    const classification = doc.toJSON()
    classification.links = {
      self: `/api/classifications/${classification.slug}`,
      super: `/api/classifications/${classification.slug}/super`,
    }
    return classification
  })
})
