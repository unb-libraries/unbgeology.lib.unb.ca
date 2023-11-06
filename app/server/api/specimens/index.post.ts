import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const specimenBody = await readSpecimenBody(event)
  const specimen = await Specimen.create(specimenBody)
  return sendEntity<Specimen>(event, specimen)
})
