import Specimen from "entity-types/Specimen"

export default defineEventHandler(async (event) => {
  const specimens = await Specimen
    .find()
    .select({ __v: false, _id: false })
    .exec()

  if (specimens.length > 0) {
    return specimens
  }

  setResponseStatus(event, 204, `No specimen objects found.`)
  return null
})
