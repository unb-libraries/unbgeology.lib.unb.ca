import { type Specimen } from "document-types/Specimen"
import { type Specimen as SpecimenEntity } from "~/types/specimen"

export default defineEventHandler(async (event) => {
  const body = await readDocumentBodyOr400(event, { model: Specimen.Base })
  const specimenOrSpecimens = await Specimen.Base.create(body)
  const specimens = Array.isArray(specimenOrSpecimens) ? specimenOrSpecimens : [specimenOrSpecimens]

  return (await Promise.all(specimens.map(async specimen => await renderDocument<SpecimenEntity, Specimen>(specimen, {
    model: Specimen.Base,
    self: specimen => `/api/specimens/${specimen.slug}`,
  })))).map(({ id, self }) => ({ id, self }))
})
