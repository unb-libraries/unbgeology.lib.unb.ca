import Specimen, { type Specimen as ISpecimen } from "~/server/entityTypes/Specimen"

export default defineEventHandler(async (event) => {
  const { id: objectId } = event.context.params!
  const specimen = await Specimen.findOne<ISpecimen>({ objectId })
  if (specimen) {
    await Specimen.deleteOne({ _id: specimen._id })
    setResponseStatus(event, 204, `Specimen object deleted.`)
    return null
  }
  return new Error(`Specimen not found`)
})
