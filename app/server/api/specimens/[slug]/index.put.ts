import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const specimenBody = await readSpecimenBody(event)
  const specimen = await Specimen.findBySlugAndUpdate(slug, specimenBody, { new: true })

  return sendEntity<Specimen>(event, specimen)
})
