import Specimen from "entity-types/Specimen"

export default defineEventHandler(async (event) => {
  const update = await readBody(event)
  const objectId = event.context.params!.id

  try {
    const specimen = await Specimen.findOneAndUpdate({ objectId }, update, {
      returnDocument: `after`,
      runValidators: true,
    }).select({ __v: false, _id: false })
    return specimen
  } catch (err) {
    console.log(err)
    throw createError({ statusCode: 500, statusMessage: `An unexpected error occurred.` })
  }
})
