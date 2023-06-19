import Specimen from "entity-types/Specimen"

export default defineEventHandler(async (event) => {
  const objectId = event.context.params!.id
  const specimen = await Specimen
    .findOne({ objectId })
    .select({ __v: false, _id: false })
    .exec()

  if (specimen) {
    return specimen
  }

  throw createError({ statusCode: 404, statusMessage: `Specimen object "${objectId}" not found.` })
})
